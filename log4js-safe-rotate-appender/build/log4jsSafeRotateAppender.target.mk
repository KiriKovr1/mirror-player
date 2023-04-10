# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := log4jsSafeRotateAppender
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=log4jsSafeRotateAppender' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_GLIBCXX_USE_CXX11_ABI=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DBUILDING_NODE_EXTENSION' \
	'-DDEBUG' \
	'-D_DEBUG' \
	'-DV8_ENABLE_CHECKS'

# Flags passed to all source files.
CFLAGS_Debug := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-m64 \
	-Wall \
	-Wextra \
	-std=c++1y \
	-O2 \
	-g \
	-O0

# Flags passed to only C files.
CFLAGS_C_Debug :=

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-std=gnu++17 \
	-Wall \
	-Wextra \
	-std=c++1y \
	-O2

INCS_Debug := \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/include/node \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/src \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/openssl/config \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/openssl/openssl/include \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/uv/include \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/zlib \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/v8/include

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=log4jsSafeRotateAppender' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_GLIBCXX_USE_CXX11_ABI=1' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DBUILDING_NODE_EXTENSION'

# Flags passed to all source files.
CFLAGS_Release := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-m64 \
	-Wall \
	-Wextra \
	-std=c++1y \
	-O2 \
	-O3 \
	-fno-omit-frame-pointer

# Flags passed to only C files.
CFLAGS_C_Release :=

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-std=gnu++17 \
	-Wall \
	-Wextra \
	-std=c++1y \
	-O2

INCS_Release := \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/include/node \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/src \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/openssl/config \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/openssl/openssl/include \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/uv/include \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/zlib \
	-I/home/ivankirilenko/.cache/node-gyp/18.12.1/deps/v8/include

OBJS := \
	$(obj).target/$(TARGET)/aaappender.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-pthread \
	-rdynamic \
	-m64

LDFLAGS_Release := \
	-pthread \
	-rdynamic \
	-m64

LIBS :=

$(obj).target/log4jsSafeRotateAppender.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/log4jsSafeRotateAppender.node: LIBS := $(LIBS)
$(obj).target/log4jsSafeRotateAppender.node: TOOLSET := $(TOOLSET)
$(obj).target/log4jsSafeRotateAppender.node: $(OBJS) FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(obj).target/log4jsSafeRotateAppender.node
# Add target alias
.PHONY: log4jsSafeRotateAppender
log4jsSafeRotateAppender: $(builddir)/log4jsSafeRotateAppender.node

# Copy this to the executable output path.
$(builddir)/log4jsSafeRotateAppender.node: TOOLSET := $(TOOLSET)
$(builddir)/log4jsSafeRotateAppender.node: $(obj).target/log4jsSafeRotateAppender.node FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/log4jsSafeRotateAppender.node
# Short alias for building this executable.
.PHONY: log4jsSafeRotateAppender.node
log4jsSafeRotateAppender.node: $(obj).target/log4jsSafeRotateAppender.node $(builddir)/log4jsSafeRotateAppender.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/log4jsSafeRotateAppender.node

