# Translog

# 🚚 Translog - Guía de Configuración de Entorno (Android + Java 21)

Este documento detalla los pasos necesarios para configurar el entorno de desarrollo y ejecutar la aplicación móvil utilizando **Capacitor** y **Java 21**.

## 📋 Requisitos Previos

* **Node.js**: v18 o superior use la version v22.16.0
* **Android Studio**: 
* **PowerShell**: Ejecutado como Administrador (para configuración inicial).

---

## ☕ 1. Configuración de Java 21 (JDK)

Para compilar con las últimas herramientas de Android (SDK 35/36), es obligatorio el uso de **JDK 21**.

### Instalación
1. Descarga el instalador desde [Adoptium (Temurin 21)](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html).
2. Instala en la ruta por defecto: `C:\Program Files\Java\jdk-21.0.10`.

### Configuración de Variables de Entorno (PowerShell Admin)
Ejecuta los siguientes comandos para que el sistema reconozca la nueva versión:

```powershell como administrador

# en caso de  no tener permisos de escritura con powershell ejecutar el siguiente comando 

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Definir JAVA_HOME
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-21.0.10", "Machine")

# Agregar al Path (solo si no existe)
$oldPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
if ($oldPath -notlike "*jdk-21\bin*") {
    [System.Environment]::SetEnvironmentVariable("Path", "C:\Program Files\Java\jdk-21.0.10\bin;$oldPath", "Machine")
}

# ejecutar los siguientes comandos desde la raiz del proyecto (/app/translog)

#1
/app/translog

npm run build

#2
npx cap sync android

#3
npx cap run android