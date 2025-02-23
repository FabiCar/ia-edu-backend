export const normalizeText = (text: string) =>  {
    return text.normalize("NFD") // Separa los caracteres en base + tilde
               .replace(/[\u0300-\u036f]/g, '') // Elimina las tildes
               .replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase(); // Elimina caracteres especiales
}