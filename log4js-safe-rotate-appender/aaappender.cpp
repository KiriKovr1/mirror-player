#include <sys/file.h>
#include <sys/errno.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

#include <stdexcept>

#include <node.h>
#include <node_buffer.h>
#include <uv.h>

////////////////////////////////////////////////////////////////////////////////

class Worker
{
public:
    template<class T = Worker>
    static void call(const v8::FunctionCallbackInfo<v8::Value> & args)
    {
        v8::Isolate * isolate(args.GetIsolate());
        Worker * self = new T();
        try
        {
            size_t argc(args.Length());
            if (argc < 1)
            {
                throw new std::runtime_error("Missed callback function");
            }
            self->workerCallback.Reset(isolate, v8::Local<v8::Function>::Cast(args[argc - 1]));
            try
            {
                args.GetReturnValue().Set(self->jobBefore(isolate, args));
                uv_queue_work(uv_default_loop(), &self->workerRequest, Worker::handleAsync, Worker::handleAsyncComplete);
            }
            catch (...)
            {
                self->workerCallback.Reset();
                throw;
            }
        }
        catch (const std::exception & exception)
        {
            delete self;
            isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, exception.what(), v8::NewStringType::kNormal).ToLocalChecked()));
        }
    }

protected:
    virtual v8::Local<v8::Value> jobBefore(v8::Isolate * isolate, const v8::FunctionCallbackInfo<v8::Value> & args)
    {
        return v8::Undefined(isolate);
    }
    virtual void job()
    {
    }
    virtual v8::Local<v8::Value> jobAfter(v8::Isolate * isolate)
    {
        return v8::Undefined(isolate);
    }

protected:
    Worker()
    {
        this->workerRequest.data = this;
    }
    virtual ~Worker()
    {
    }

    uv_work_t workerRequest;
    v8::Persistent<v8::Function> workerCallback;
    std::unique_ptr<std::string> workerError;

private:
    static void handleAsync(uv_work_t * request)
    {
        Worker * self = static_cast<Worker *>(request->data);
        try
        {
            self->job();
        }
        catch (const std::exception & exception)
        {
            self->workerError.reset(new std::string(exception.what()));
        }
    }

    static void handleAsyncComplete(uv_work_t * request, int status)
    {
        Worker * self = static_cast<Worker *>(request->data);
        v8::Isolate * isolate = v8::Isolate::GetCurrent();
        v8::HandleScope handleScope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Local<v8::Value> result(v8::Undefined(isolate));
        if (!self->workerError)
        {
            try
            {
                result = self->jobAfter(isolate);
            }
            catch (const std::exception & exception)
            {
                self->workerError.reset(new std::string(exception.what()));
            }
        }
        v8::Local<v8::Value> error(v8::Undefined(isolate));
        if (self->workerError)
        {
            error = v8::Exception::Error(v8::String::NewFromUtf8(isolate, self->workerError->c_str(), v8::NewStringType::kNormal).ToLocalChecked());
        }
        v8::Local<v8::Value> argv[] = {
            error,
            result,
        };
        v8::Local<v8::Function>::New(isolate, self->workerCallback)->Call(
            context,
            v8::Null(isolate),
            sizeof(argv) / sizeof(argv[0]),
            argv
        ).ToLocalChecked();
        self->workerCallback.Reset();
        delete self;
    }
};

////////////////////////////////////////////////////////////////////////////////

class WorkerAppend : public Worker
{
    virtual v8::Local<v8::Value> jobBefore(v8::Isolate * isolate, const v8::FunctionCallbackInfo<v8::Value> & args) override
    {
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        int pos(0);

        v8::String::Utf8Value name(isolate, args[pos ++]->ToString(context).ToLocalChecked());
        v8::Local<v8::Object> buffer(v8::Local<v8::Object>::Cast(args[pos ++]));

        this->name = std::string(*name, name.length());
        if (!buffer->IsArrayBufferView())
        {
            throw std::runtime_error("Buffer required");
        }
        char * data(node::Buffer::Data(buffer));
        size_t length(node::Buffer::Length(buffer));
        this->buffer = std::vector< char >(data, data + length);

        return Worker::jobBefore(isolate, args);
    }
    virtual void job() override
    {
        int fd(::open(this->name.c_str(), O_CREAT | O_APPEND | O_WRONLY, 0644));
        if (-1 == fd)
        {
            throw std::runtime_error("Open <" + this->name + "> failure: " + std::string(strerror(errno)));
        }
        try
        {
            if (-1 == ::flock(fd, LOCK_EX))
            {
                throw std::runtime_error("Lock <" + this->name + "> failure: " + std::string(strerror(errno)));
            }
            try
            {
                size_t size(::write(fd, &this->buffer.front(), this->buffer.size()));
                if (-1 == static_cast< int >(size))
                {
                    throw std::runtime_error("Write <" + this->name + "> failure: " + std::string(strerror(errno)));
                }
                if (this->buffer.size() != size)
                {
                    throw std::runtime_error("Write <" + this->name + "> failure: written " + std::to_string(size) + " of " + std::to_string(this->buffer.size()));
                }
            }
            catch (...)
            {
                ::flock(fd, LOCK_UN);
                throw;
            }
            if (-1 == ::flock(fd, LOCK_UN))
            {
                throw std::runtime_error("Unlock <" + this->name + "> failure: " + std::string(strerror(errno)));
            }
        }
        catch (...)
        {
            close(fd);
            throw;
        }
        close(fd);
    }

private:
    std::string name;
    std::vector< char > buffer;
};

////////////////////////////////////////////////////////////////////////////////

class WorkerRename : public Worker
{
    virtual v8::Local<v8::Value> jobBefore(v8::Isolate * isolate, const v8::FunctionCallbackInfo<v8::Value> & args) override
    {
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        int pos(0);

        v8::String::Utf8Value oldName(isolate, args[pos ++]->ToString(context).ToLocalChecked());
        v8::String::Utf8Value newName(isolate, args[pos ++]->ToString(context).ToLocalChecked());
        v8::Local<v8::Array> guardNames(v8::Local<v8::Array>::Cast(args[pos ++]));
        for (size_t index = 0; index < guardNames->Length(); index ++)
        {
            v8::String::Utf8Value guardName(isolate, guardNames->Get(context, index).ToLocalChecked()->ToString(context).ToLocalChecked());
            this->guardNames.push_back(std::string(*guardName, guardName.length()));
        }

        this->oldName = std::string(*oldName, oldName.length());
        this->newName = std::string(*newName, newName.length());

        return Worker::jobBefore(isolate, args);
    }
    virtual void job() override
    {
        int fd(::open(this->oldName.c_str(), O_RDONLY));
        if (-1 == fd)
        {
            throw std::runtime_error("Open <" + this->oldName + "> failure: " + std::string(strerror(errno)));
        }
        try
        {
            if (-1 == ::flock(fd, LOCK_EX))
            {
                throw std::runtime_error("Lock <" + this->oldName + "> failure: " + std::string(strerror(errno)));
            }
            try
            {
                for (const std::string & guardName : this->guardNames)
                {
                    struct stat statbuf;
                    if (0 == ::stat(guardName.c_str(), &statbuf))
                    {
                        throw std::runtime_error("Guard <" + guardName + "> found");
                    }
                }
                if (-1 == ::rename(this->oldName.c_str(), this->newName.c_str()))
                {
                    throw std::runtime_error("Rename <" + this->oldName + " -> " + this->newName + "> failure: " + std::string(strerror(errno)));
                }
            }
            catch (...)
            {
                ::flock(fd, LOCK_UN);
                throw;
            }
            if (-1 == ::flock(fd, LOCK_UN))
            {
                throw std::runtime_error("Unlock <" + this->oldName + "> failure: " + std::string(strerror(errno)));
            }
        }
        catch (...)
        {
            close(fd);
            throw;
        }
        close(fd);
    }

private:
    std::string oldName;
    std::string newName;
    std::vector< std::string > guardNames;
};

////////////////////////////////////////////////////////////////////////////////

static void moduleInit(v8::Local<v8::Object> exports)
{
    NODE_SET_METHOD(exports, "append", Worker::call<WorkerAppend>);
    NODE_SET_METHOD(exports, "rename", Worker::call<WorkerRename>);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, moduleInit);

////////////////////////////////////////////////////////////////////////////////
