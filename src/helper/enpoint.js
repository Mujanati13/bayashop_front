export const Endpoint = (dev = true)  =>{
    return dev ? 'http://localhost:4004' : 'https://api';
}