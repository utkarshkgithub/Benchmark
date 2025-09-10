package com.iiitbh.benchmark

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.MessageDigest
import java.security.Signature
import java.security.spec.ECGenParameterSpec
import java.util.ArrayList
import java.util.HashMap

object KeyHelper {
        private const val KEY_ALIAS = "benchmark_device_key"
        private const val ATTESTATION_KEY_ALIAS = "benchmark_attestation_key"
        
        fun generateKeyPairIfNeeded(alias: String = KEY_ALIAS) {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            
            if (keyStore.containsAlias(alias)) return
            
            val kpg = KeyPairGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_EC,
                "AndroidKeyStore"
            )
            
            val paramSpec = KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
            )
            .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
            .setDigests(KeyProperties.DIGEST_SHA256, KeyProperties.DIGEST_SHA512)
            .setUserAuthenticationRequired(false)
            .build()
            
            kpg.initialize(paramSpec)
            kpg.generateKeyPair()
        }
        
        fun getPublicKey(alias: String = KEY_ALIAS): ByteArray {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            val cert = keyStore.getCertificate(alias)
            return cert.publicKey.encoded
        }
        
        fun sign(data: ByteArray, alias: String = KEY_ALIAS): ByteArray {
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            val privateKey = keyStore.getKey(alias, null) as java.security.PrivateKey
            
            val sig = Signature.getInstance("SHA256withECDSA")
            sig.initSign(privateKey)
            sig.update(data)
            return sig.sign()
        }
        
        fun generateAttestationKey(challengeB64: String): HashMap<String, Any> {
            val challenge = Base64.decode(challengeB64, Base64.NO_WRAP)
            
            val keyStore = KeyStore.getInstance("AndroidKeyStore")
            keyStore.load(null)
            if (keyStore.containsAlias(ATTESTATION_KEY_ALIAS)) {
                keyStore.deleteEntry(ATTESTATION_KEY_ALIAS)
            }
            
            val kpg = KeyPairGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_EC,
                "AndroidKeyStore"
            )
            
            val paramSpec = KeyGenParameterSpec.Builder(
                ATTESTATION_KEY_ALIAS,
                KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
            )
            .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
            .setDigests(KeyProperties.DIGEST_SHA256)
            .setAttestationChallenge(challenge)
            .setUserAuthenticationRequired(false)
            .build()
            
            kpg.initialize(paramSpec)
            kpg.generateKeyPair()
            
            keyStore.load(null)
            val certChain = keyStore.getCertificateChain(ATTESTATION_KEY_ALIAS)
            
            val certChainB64 = ArrayList<String>()
            if (certChain != null) {
                for (cert in certChain) {
                    certChainB64.add(Base64.encodeToString(cert.encoded, Base64.NO_WRAP))
                }
            }
            
            val publicKey = getPublicKey(ATTESTATION_KEY_ALIAS)
            
            val result = HashMap<String, Any>()
            result["publicKey"] = Base64.encodeToString(publicKey, Base64.NO_WRAP)
            result["attestationChain"] = certChainB64
            result["keyAlias"] = ATTESTATION_KEY_ALIAS
            
            return result
        }
        
        fun generateDeviceFingerprint(context: Context): String {
            val identifiers = ArrayList<String>()
            
            identifiers.add(Build.BOARD)
            identifiers.add(Build.BOOTLOADER)
            identifiers.add(Build.BRAND)
            identifiers.add(Build.DEVICE)
            identifiers.add(Build.HARDWARE)
            identifiers.add(Build.MANUFACTURER)
            identifiers.add(Build.MODEL)
            identifiers.add(Build.PRODUCT)
            
            try {
                if (Build.SERIAL.length > 8) {
                    identifiers.add(Build.SERIAL.substring(0, 8))
                } else {
                    identifiers.add(Build.SERIAL)
                }
            } catch (e: Exception) {
                identifiers.add("unknown_serial")
            }
            
            val displayMetrics = context.resources.displayMetrics
            identifiers.add(displayMetrics.widthPixels.toString() + "x" + displayMetrics.heightPixels.toString())
            identifiers.add(displayMetrics.densityDpi.toString())
            
            try {
                val abis = Build.SUPPORTED_ABIS
                val abiString = StringBuilder()
                for (i in abis.indices) {
                    if (i > 0) abiString.append(",")
                    abiString.append(abis[i])
                }
                identifiers.add(abiString.toString())
            } catch (e: Exception) {
                // Ignore if not available
            }
            
            val combined = StringBuilder()
            for (i in identifiers.indices) {
                if (i > 0) combined.append("|")
                combined.append(identifiers[i])
            }
            
            val digest = MessageDigest.getInstance("SHA-256")
            val hashBytes = digest.digest(combined.toString().toByteArray())
            
            val hexString = StringBuilder()
            for (b in hashBytes) {
                val hex = Integer.toHexString(0xff and b.toInt())
                if (hex.length == 1) {
                    hexString.append('0')
                }
                hexString.append(hex)
            }
            
            return hexString.toString()
        }
        
        fun getHardwareIdentifiers(): String {
            // Return concatenated hardware identifiers as requested
            val board = Build.BOARD ?: "unknown"
            val brand = Build.BRAND ?: "unknown"
            val device = Build.DEVICE ?: "unknown"
            val hardware = Build.HARDWARE ?: "unknown"
            val manufacturer = Build.MANUFACTURER ?: "unknown"
            val model = Build.MODEL ?: "unknown"
            val product = Build.PRODUCT ?: "unknown"
            
            return "${board}_${brand}_${device}_${hardware}_${manufacturer}_${model}_${product}"
        }
    }
