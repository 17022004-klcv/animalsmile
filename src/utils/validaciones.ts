export class Validaciones {
  // =========================================================================
  // FORMATEADORES EN TIEMPO REAL (para usar en onChange)
  // =========================================================================

  /**
   * Permite únicamente letras (con tildes y ñ), espacios y limita a un máximo (por defecto 50).
   */
  static formatearSoloLetras(valor: string, maxLength = 50): string {
    return valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "").slice(0, maxLength);
  }

  /**
   * Formatea teléfono salvadoreño al patrón 0000-0000 (máximo 8 dígitos).
   */
  static formatearTelefono(valor: string): string {
    const digitos = valor.replace(/\D/g, "").slice(0, 8);
    if (digitos.length <= 4) return digitos;
    return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
  }

  /**
   * Formatea número de tarjeta al patrón 0000-0000-0000-0000 (máximo 16 dígitos).
   */
  static formatearTarjeta(valor: string): string {
    const digitos = valor.replace(/\D/g, "").slice(0, 16);
    const grupos = digitos.match(/.{1,4}/g);
    return grupos ? grupos.join("-") : "";
  }

  /**
   * Formatea CVV a exactamente 3 dígitos numéricos (000).
   */
  static formatearCVV(valor: string): string {
    return valor.replace(/\D/g, "").slice(0, 3);
  }

  // =========================================================================
  // VALIDADORES (devuelven string con el mensaje de error o null si es válido)
  // =========================================================================

  /**
   * Valida que el texto contenga solo letras y no supere maxLength (50 por defecto).
   */
  static validarSoloLetras(
    valor: string,
    campo: string,
    { requerido = false, maxLength = 50 } = {},
  ): string | null {
    const limpio = valor.trim();
    if (!limpio) {
      return requerido ? `El campo "${campo}" es obligatorio.` : null;
    }
    if (limpio.length > maxLength) {
      return `El campo "${campo}" no puede tener más de ${maxLength} caracteres.`;
    }
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!regex.test(limpio)) {
      return `El campo "${campo}" solo permite letras y espacios.`;
    }
    return null;
  }

  /**
   * Valida formato de correo electrónico estándar.
   */
  static validarEmail(valor: string, requerido = false): string | null {
    const limpio = valor.trim();
    if (!limpio) {
      return requerido ? "El correo electrónico es obligatorio." : null;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regex.test(limpio)) {
      return "Ingresa un correo electrónico válido (ej. usuario@dominio.com).";
    }
    return null;
  }

  /**
   * Valida teléfono con formato estricto 0000-0000.
   */
  static validarTelefono(valor: string, requerido = false): string | null {
    const limpio = valor.trim();
    if (!limpio) {
      return requerido ? "El número de teléfono es obligatorio." : null;
    }
    const regex = /^\d{4}-\d{4}$/;
    if (!regex.test(limpio)) {
      return "El teléfono debe tener el formato 0000-0000.";
    }
    return null;
  }

  /**
   * Valida número de tarjeta con formato estricto 0000-0000-0000-0000.
   */
  static validarTarjeta(valor: string, requerido = true): string | null {
    const limpio = valor.trim();
    if (!limpio) {
      return requerido ? "El número de tarjeta es obligatorio." : null;
    }
    const regex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    if (!regex.test(limpio)) {
      return "El número de tarjeta debe tener el formato 0000-0000-0000-0000.";
    }
    return null;
  }

  /**
   * Valida código CVV de 3 dígitos (000).
   */
  static validarCVV(valor: string, requerido = true): string | null {
    const limpio = valor.trim();
    if (!limpio) {
      return requerido ? "El código CVV es obligatorio." : null;
    }
    const regex = /^\d{3}$/;
    if (!regex.test(limpio)) {
      return "El CVV debe contener exactamente 3 dígitos (000).";
    }
    return null;
  }
}
