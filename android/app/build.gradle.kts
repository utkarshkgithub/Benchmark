plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.iiitbh.benchmark"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17  // Updated to Java 17 LTS
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        applicationId = "com.iiitbh.benchmark"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            storeFile = file("../my-release-key.jks")
            storePassword = project.findProperty("MYAPP_KEYSTORE_PASSWORD") as String?
            keyAlias = project.findProperty("MYAPP_KEY_ALIAS") as String?
            keyPassword = project.findProperty("MYAPP_KEY_PASSWORD") as String?
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = true  // Temporarily disable minification
            isShrinkResources = true  // Temporarily disable resource shrinking
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    // Correct Kotlin DSL syntax for dependencies
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:2.1.0")
    // implementation("org.jetbrains.kotlin:kotlin-stdlib:2.1.0")
}
