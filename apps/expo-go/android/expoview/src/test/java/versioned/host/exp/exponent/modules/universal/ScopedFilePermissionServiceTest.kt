package versioned.host.exp.exponent.modules.universal

import android.content.pm.ApplicationInfo
import android.test.mock.MockContext
import expo.modules.kotlin.services.FilePermissionService.Permission
import host.exp.exponent.kernel.ExperienceKey
import host.exp.exponent.utils.ScopedContext
import java.io.File
import java.util.EnumSet
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

class ScopedFilePermissionServiceTest {
  @get:Rule
  val temporaryFolder = TemporaryFolder()

  @Test
  fun grantsCurrentExperienceScopedDirectoriesWhenCalledWithBaseContext() {
    val baseContext = testContext()
    val scopedContext = ScopedContext(baseContext, ExperienceKey("owner"))
    val service = ScopedFilePermissionService(scopedContext)

    assertEquals(readWrite, service.getPathPermissions(baseContext, scopedContext.filesDir.path))
    assertEquals(readWrite, service.getPathPermissions(baseContext, scopedContext.cacheDir.path))
    assertEquals(readWrite, service.getPathPermissions(baseContext, scopedContext.noBackupFilesDir.path))
  }

  @Test
  fun deniesOtherExperienceFilesWhenCalledWithBaseContext() {
    val baseContext = testContext()
    val scopedContext = ScopedContext(baseContext, ExperienceKey("owner"))
    val service = ScopedFilePermissionService(scopedContext)
    val otherExperienceFile = File(baseContext.filesDir, "ExperienceData/other-scope/file.txt").apply {
      parentFile?.mkdirs()
      createNewFile()
    }

    assertEquals(noPermissions, service.getPathPermissions(baseContext, otherExperienceFile.path))
  }

  @Test
  fun preservesAccessOutsideExpoGoDataDirectory() {
    val baseContext = testContext()
    val scopedContext = ScopedContext(baseContext, ExperienceKey("owner"))
    val service = ScopedFilePermissionService(scopedContext)
    val externalFile = temporaryFolder.newFile("external.txt")

    assertEquals(readWrite, service.getPathPermissions(baseContext, externalFile.path))
  }

  private fun testContext(): MockContext {
    val dataDir = temporaryFolder.newFolder("data")
    return object : MockContext() {
      private val applicationInfo = ApplicationInfo().apply {
        this.dataDir = dataDir.path
      }

      override fun getApplicationInfo(): ApplicationInfo = applicationInfo
      override fun getFilesDir(): File = File(dataDir, "files").apply { mkdirs() }
      override fun getCacheDir(): File = File(dataDir, "cache").apply { mkdirs() }
      override fun getNoBackupFilesDir(): File = File(dataDir, "no-backup").apply { mkdirs() }
      override fun getPackageName(): String = "host.exp.exponent"
    }
  }

  private val readWrite = EnumSet.of(Permission.READ, Permission.WRITE)
  private val noPermissions = EnumSet.noneOf(Permission::class.java)
}
