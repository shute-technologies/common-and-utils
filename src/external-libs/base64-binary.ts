/*
Copyright (c) 2011, Daniel Guerrero
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Uses the new array typed in javascript to binary base64 encode/decode
 * at the moment just decodes a binary base64 encoded
 * into either an ArrayBuffer (decodeArrayBuffer)
 * or into an Uint8Array (decode)
 * 
 * References:
 * https://developer.mozilla.org/en/JavaScript_typed_arrays/ArrayBuffer
 * https://developer.mozilla.org/en/JavaScript_typed_arrays/Uint8Array
 */

export class Base64Binary {
	// Must be an assignment. It used to be declared with ':' (a string-literal *type*), so the
	// alphabet was never set and every decode threw on `undefined.indexOf`.
	private static readonly _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	/* will return an ArrayBuffer holding exactly the decoded bytes */
	static decodeArrayBuffer (input: string): ArrayBuffer {
		const ab = new ArrayBuffer(Base64Binary.decodedLength(input));
		Base64Binary.decode(input, ab);

		return ab;
	}

	/**
	 * Number of bytes `input` decodes to. Characters outside the alphabet (line breaks, spaces)
	 * and the trailing '=' padding carry no data, so neither counts.
	 */
	static decodedLength (input: string): number {
		const data = Base64Binary.removePaddingChars(Base64Binary.removePaddingChars(Base64Binary.removeInvalidChars(input)));

		return Math.floor((data.length * 3) / 4);
	}

	static removePaddingChars (input: string) {
		const lkey = Base64Binary._keyStr.indexOf(input.charAt(input.length - 1));

		if(lkey == 64){
			return input.substring(0,input.length - 1);
		}

		return input;
	}

	static decode (input: string, arrayBuffer?: ArrayBuffer): Uint8Array {
		// strip line breaks etc. first, so neither the padding check nor the length sees them
		input = Base64Binary.removeInvalidChars(input);
		//get last chars to see if are valid
		input = Base64Binary.removePaddingChars(input);
		input = Base64Binary.removePaddingChars(input);

		const bytes = Math.floor((input.length * 3) / 4);

		let uarray: Uint8Array;
		let chr1, chr2, chr3;
		let enc1, enc2, enc3, enc4;
		let i = 0;
		let j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		for (i=0; i<bytes; i+=3) {
			//get the 3 octects in 4 ascii chars
			enc1 = Base64Binary._keyStr.indexOf(input.charAt(j++));
			enc2 = Base64Binary._keyStr.indexOf(input.charAt(j++));
			enc3 = Base64Binary._keyStr.indexOf(input.charAt(j++));
			enc4 = Base64Binary._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			// the last group may hold only 1 or 2 bytes: never write past the decoded length
			uarray[i] = chr1;
			if (i + 1 < bytes) uarray[i+1] = chr2;
			if (i + 2 < bytes) uarray[i+2] = chr3;
		}

		return uarray;
	}

	private static removeInvalidChars (input: string): string {
		return input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	}
}
