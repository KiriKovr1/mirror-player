{
  "targets": [
    {
      "target_name": "log4jsSafeRotateAppender",
      "cflags": ["-Wall", "-Wextra", "-std=c++1y", "-O2"],
      "cflags_cc": ["-Wall", "-Wextra", "-std=c++1y", "-O2"],
      "cflags_c++": ["-Wall", "-Wextra", "-std=c++1y", "-O2"],
      "cflags!": ["-fno-exceptions", "-fno-rtti"],
      "cflags_cc!": ["-fno-exceptions", "-fno-rtti"],
      "cflags_c++!": ["-fno-exceptions", "-fno-rtti"],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "GCC_ENABLE_CPP_RTTI": "YES"
      },
      "sources": ["aaappender.cpp"],
      "include_dirs": [],
      "libraries": []
    }
  ]
}
