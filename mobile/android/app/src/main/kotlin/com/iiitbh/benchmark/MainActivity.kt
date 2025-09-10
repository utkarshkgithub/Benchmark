package com.iiitbh.benchmark

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Base64
import android.widget.Toast
import androidx.annotation.RequiresApi
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.security.MessageDigest

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.iiitbh.benchmark/keystore"

    override fun onCreate(savedInstanceState: Bundle?) {
        // First, let's temporarily disable clone detection for testing
        // if (detectCloneEnvironment(this)) {
        //     try {
        //         Toast.makeText(this, "App not supported in this environment.", Toast.LENGTH_LONG).show()
        //     } catch (_: Exception) {}
        //     finishAffinity()
        //     System.exit(0)
        //     return
        // }

        super.onCreate(savedInstanceState)
    }
    
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "getPublicKey" -> {
                        try {
                            KeyHelper.generateKeyPairIfNeeded()
                            val pubKey = KeyHelper.getPublicKey()
                            result.success(Base64.encodeToString(pubKey, Base64.NO_WRAP))
                        } catch (e: Exception) {
                            result.error("ERR", e.message, null)
                        }
                    }
                    
                    "sign" -> {
                        try {
                            val nonce = call.argument<String>("nonce")!!
                            val sig = KeyHelper.sign(Base64.decode(nonce, Base64.NO_WRAP))
                            result.success(Base64.encodeToString(sig, Base64.NO_WRAP))
                        } catch (e: Exception) {
                            result.error("ERR", e.message, null)
                        }
                    }
                    
                    "generateAttestationKey" -> {
                        try {
                            val challengeB64 = call.argument<String>("challenge")!!
                            val attestationData = KeyHelper.generateAttestationKey(challengeB64)
                            result.success(attestationData)
                        } catch (e: Exception) {
                            result.error("ERR", e.message, null)
                        }
                    }
                    
                    "getDeviceFingerprint" -> {
                        try {
                            val fingerprint = KeyHelper.generateDeviceFingerprint(this)
                            result.success(fingerprint)
                        } catch (e: Exception) {
                            result.error("ERR", e.message, null)
                        }
                    }
                    
                    "getHardwareIdentifiers" -> {
                        try {
                            val identifiers = KeyHelper.getHardwareIdentifiers()
                            result.success(identifiers)
                        } catch (e: Exception) {
                            result.error("ERR", e.message, null)
                        }
                    }
                    
                    else -> result.notImplemented()
                }
            }
    }

    private fun detectCloneEnvironment(context: Context): Boolean {
        var cloneScore = 0.0
        val reasons = mutableListOf<String>()
        
        if (hasKnownClonerPackages(context)) {
            cloneScore += 0.6
            reasons.add("Known cloner packages detected")
        }
        
        if (hasUnusualInstallationPatterns(context)) {
            cloneScore += 0.3
            reasons.add("Unusual installation patterns")
        }
        
        if (hasVirtualizationIndicators()) {
            cloneScore += 0.3
            reasons.add("Virtualization indicators found")
        }
        
        if (!isSignatureValid(context, EXPECTED_SHA256_HEX)) {
            cloneScore += 0.8
            reasons.add("Signature mismatch")
        }
        
        if (hasMultipleUserProfiles(context)) {
            cloneScore += 0.2
            reasons.add("Multiple user profiles detected")
        }
        
        if (cloneScore >= 0.8) {
            android.util.Log.d("CloneDetection", "Clone environment detected. Score: $cloneScore, Reasons: ${reasons.joinToString()}")
        }
        
        return cloneScore >= 0.8
    }
    
    private fun hasKnownClonerPackages(context: Context): Boolean {
        val clonerPackages = listOf(
            "com.lbe.parallel",
            "com.parallel.space",
            "com.parallel.space.lite",
            "com.excelliance.multiaccounts",
            "com.ludashi.dualspace",
            "com.virtualapp",
            "io.virtualapp"
        )

        val pm = context.packageManager
        return clonerPackages.any { pkg ->
            try {
                pm.getPackageInfo(pkg, PackageManager.GET_ACTIVITIES)
                true
            } catch (e: PackageManager.NameNotFoundException) {
                false
            } catch (e: Exception) {
                false
            }
        }
    }

    private fun hasUnusualInstallationPatterns(context: Context): Boolean {
        // Check if the app is installed in an unusual location
        val dataDir = context.applicationInfo.dataDir ?: return true
        
        // Normal installation paths
        val normalPaths = listOf(
            "/data/app/",
            "/data/user/0/",
            "/data/data/"
        )
        
        // Check if the data directory is in a normal location
        return !normalPaths.any { dataDir.contains(it) }
    }

    private fun hasVirtualizationIndicators(): Boolean {
        // Check for common virtualization indicators
        try {
            // Check build properties for virtualization clues
            val brand = Build.BRAND?.lowercase() ?: ""
            val model = Build.MODEL?.lowercase() ?: ""
            val manufacturer = Build.MANUFACTURER?.lowercase() ?: ""
            val product = Build.PRODUCT?.lowercase() ?: ""
            
            val virtualIndicators = listOf(
                "sdk", "emulator", "genymotion", "vbox", "virtual", "test"
            )
            
            return virtualIndicators.any { 
                brand.contains(it) || model.contains(it) || manufacturer.contains(it) || product.contains(it)
            }
        } catch (e: Exception) {
            return false
        }
    }

    private fun hasMultipleUserProfiles(context: Context): Boolean {
        // Check if we're running in a secondary user profile
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            val userId = android.os.Process.myUid() / 100000
            return userId != 0
        }
        return false
    }

    private fun isSignatureValid(context: Context, expectedHex: String): Boolean {
        if (expectedHex.isEmpty()) {
            return true
        }

        try {
            val pm = context.packageManager
            val packageName = context.packageName
            val packageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pm.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)
            } else {
                pm.getPackageInfo(packageName, PackageManager.GET_SIGNATURES)
            }

            val certBytes: ByteArray? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val signers = packageInfo.signingInfo?.apkContentsSigners
                if (signers != null && signers.isNotEmpty()) signers[0].toByteArray() else null
            } else {
                val sigs = packageInfo.signatures
                if (sigs != null && sigs.isNotEmpty()) sigs[0].toByteArray() else null
            }

            if (certBytes == null) return false

            val md = MessageDigest.getInstance("SHA-256")
            val digest = md.digest(certBytes)
            val hex = digest.joinToString("") { "%02x".format(it) }

            // Compare normalized
            return hex.equals(expectedHex.replace(":", "").lowercase(), ignoreCase = true)
        } catch (e: Exception) {
            return false
        }
    }

    companion object {
        // Use the SHA256_HEX from .env file - remove colons and use as expected fingerprint
        private const val EXPECTED_SHA256_HEX = "34B60EE25B5A5A68AE20259DF2E629A95CB4B9BFA3FBECDFBBA5942608954094"
    }
}