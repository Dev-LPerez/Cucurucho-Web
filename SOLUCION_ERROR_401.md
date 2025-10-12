# Solución al Error 401 (Unauthorized)

## Problema
Estás recibiendo errores 401 al intentar acceder a los recursos de productos e inventario porque las peticiones no están autenticadas.

## Cambios Realizados

He agregado logs de depuración en los siguientes archivos:
1. **api.js** - Para verificar si el token existe antes de cada petición
2. **authService.js** - Para verificar que el login guarde correctamente el token
3. **ProtectedRoute.jsx** - Para verificar si hay token al acceder a rutas protegidas

## Pasos para Solucionar

### 1. Asegúrate de que el backend esté corriendo
```cmd
cd cucurucho-backend
npm run start:dev
```

### 2. Asegúrate de que el frontend esté corriendo
```cmd
cd cucurucho-frontend
npm run dev
```

### 3. **IMPORTANTE: Inicia sesión primero**
Antes de acceder a `/admin` o cualquier otra ruta protegida:

1. Ve a `http://localhost:5173/login`
2. Ingresa tus credenciales (usuario y contraseña)
3. Presiona "Entrar"
4. El sistema te redirigirá automáticamente al dashboard
5. Abre la consola del navegador (F12) y verás:
   - "Respuesta del login: {...}"
   - "Token guardado exitosamente"

### 4. Verifica el token en la consola
Después de iniciar sesión, abre la consola del navegador y escribe:
```javascript
localStorage.getItem('user_token')
```

Deberías ver un token JWT largo. Si ves `null`, el login no funcionó correctamente.

### 5. Ahora puedes acceder a las rutas protegidas
Una vez autenticado, puedes navegar a:
- `/dashboard`
- `/admin`
- `/pos`
- `/products`
- `/inventory`
- `/tables`

## Debugging

Con los logs agregados, verás en la consola del navegador:

**Al hacer login:**
- ✅ "Respuesta del login: { access_token: '...' }"
- ✅ "Token guardado exitosamente"

**Al acceder a una ruta protegida:**
- ✅ "ProtectedRoute - Token presente: true"

**Al hacer una petición a la API:**
- ✅ "Token encontrado: Sí (longitud: XXX)"

**Si algo falla:**
- ❌ "No hay token, redirigiendo a login"
- ❌ "Token encontrado: No"
- ❌ "Error 401: No autorizado. Token inválido o expirado."

## Causas Comunes del Error 401

1. **No has iniciado sesión** - Debes ir a `/login` primero
2. **Token expirado** - Cierra sesión e inicia sesión nuevamente
3. **Backend no está corriendo** - Verifica que el servidor esté en `http://localhost:3000`
4. **Credenciales incorrectas** - Verifica que el usuario exista en la base de datos

## Crear un Usuario de Prueba

Si necesitas crear un usuario administrador, ejecuta esto en el backend:

```typescript
// En cucurucho-backend/src/main.ts o en un seed file
const bcrypt = require('bcrypt');
const password = await bcrypt.hash('admin123', 10);
console.log('Hash generado:', password);

// Luego inserta en la BD:
INSERT INTO "user" (username, password_hash, role) 
VALUES ('admin', '<hash_generado>', 'admin');
```

## Nota Final

El error 401 es **NORMAL y ESPERADO** si no has iniciado sesión. El sistema de autenticación está funcionando correctamente. Solo necesitas:

1. ✅ Iniciar sesión primero
2. ✅ El token se guardará automáticamente
3. ✅ Todas las peticiones posteriores incluirán el token
4. ✅ Podrás acceder a todas las rutas protegidas

