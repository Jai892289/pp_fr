declare module 'crypto-js' {
  export interface WordArray {
    toString(encoder?: unknown): string;
  }
  
  export interface CipherParams {
    ciphertext: WordArray;
  }
  
  export namespace AES {
    function encrypt(message: string, key: WordArray, options?: unknown): CipherParams;
    function decrypt(ciphertext: string, key: WordArray, options?: unknown): WordArray;
  }
  
  export function SHA256(message: string): WordArray;
  
  export namespace enc {
    namespace Utf8 {
      function parse(input: string): WordArray;
      function stringify(wordArray: WordArray): string;
    }
    namespace Hex {
      function parse(input: string): WordArray;
      function stringify(wordArray: WordArray): string;
    }
    namespace Base64 {
      function parse(input: string): WordArray;
      function stringify(wordArray: WordArray): string;
    }
  }
  
  export namespace mode {
    const CBC: unknown;
  }
  
  export namespace pad {
    const Pkcs7: unknown;
  }
  
  export namespace lib {
    namespace WordArray {
      function random(nBytes: number): WordArray;
    }
  }
  
  const CryptoJS: {
    AES: typeof AES;
    SHA256: typeof SHA256;
    enc: typeof enc;
    mode: typeof mode;
    pad: typeof pad;
    lib: typeof lib;
  };
  
  export default CryptoJS;
}
