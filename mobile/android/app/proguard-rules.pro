# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Keep safe_device package classes
-keep class com.kevlar.** { *; }
-dontwarn com.kevlar.**

# Keep libsuperuser classes (used by safe_device for root detection)
-keep class com.topjohnwu.superuser.** { *; }
-dontwarn com.topjohnwu.superuser.**

# Specifically keep the missing classes mentioned in the error
-keep class com.topjohnwu.superuser.Shell { *; }
-keep class com.topjohnwu.superuser.Shell$Job { *; }
-keep class com.topjohnwu.superuser.Shell$Result { *; }

# Keep app_security package classes
-keep class com.kevlar.app_security.** { *; }
-dontwarn com.kevlar.app_security.**

# Keep classes for rooting detection
-keep class com.kevlar.rooting.** { *; }
-dontwarn com.kevlar.rooting.**

# Keep rooting shell classes that are causing issues
-keep class com.kevlar.rooting.shell.** { *; }
-keep class com.kevlar.rooting.shell.dump.** { *; }
-dontwarn com.kevlar.rooting.shell.**

# Generated missing rules from R8
-dontwarn com.topjohnwu.superuser.Shell$Job
-dontwarn com.topjohnwu.superuser.Shell$Result
-dontwarn com.topjohnwu.superuser.Shell

# Google Play Core classes (Flutter deferred components)
-keep class com.google.android.play.core.** { *; }
-dontwarn com.google.android.play.core.**
-dontwarn com.google.android.play.core.splitcompat.SplitCompatApplication
-dontwarn com.google.android.play.core.splitinstall.**
-dontwarn com.google.android.play.core.tasks.**

# Disable minification for safe_device and app_security packages entirely
-keep,allowobfuscation class com.kevlar.** { *; }
-keep,allowobfuscation class com.topjohnwu.superuser.** { *; }

# Keep all Flutter deferred components
-keep class io.flutter.embedding.engine.deferredcomponents.** { *; }
-dontwarn io.flutter.embedding.engine.deferredcomponents.**

# Additional safety net for missing dependencies
-dontwarn **

# Keep native method names for JNI calls
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep classes that implement Parcelable
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Flutter and Dart specific rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Keep method channel classes
-keep class com.iiitbh.benchmark.MainActivity { *; }
-keep class com.iiitbh.benchmark.KeyHelper { *; }

# Additional rules for safe_device dependencies
-keep class eu.chainfire.libsuperuser.** { *; }
-dontwarn eu.chainfire.libsuperuser.**

# Keep reflection-based access
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod
