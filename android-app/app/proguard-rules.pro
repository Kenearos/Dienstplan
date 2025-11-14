# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in ${sdk.dir}/tools/proguard/proguard-android.txt

# Keep data classes
-keep class com.dienstplan.nrw.model.** { *; }

# Keep ViewBinding classes
-keep class com.dienstplan.nrw.databinding.** { *; }
