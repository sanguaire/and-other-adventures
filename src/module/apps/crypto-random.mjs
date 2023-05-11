export class CryptoRandom {
    getRandomNumber() {
        let randomInt = new Uint32Array(1);
        window.crypto.getRandomValues(randomInt);
        return randomInt[0] / (Math.pow(2, 32) - 1);
    }
}
