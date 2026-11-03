export type Lib_Totp_Base32Alphabet = string;

export type Lib_Totp_EncodeBase32_Bytes = Buffer;
export type Lib_Totp_EncodeBase32_Result = string;
export type Lib_Totp_EncodeBase32_Returns = string;
export type Lib_Totp_EncodeBase32_Bits = number;
export type Lib_Totp_EncodeBase32_Value = number;

export type Lib_Totp_DecodeBase32_Secret = string;
export type Lib_Totp_DecodeBase32_Returns = Buffer;
export type Lib_Totp_DecodeBase32_Bits = number;
export type Lib_Totp_DecodeBase32_Value = number;
export type Lib_Totp_DecodeBase32_Values = number[];
export type Lib_Totp_DecodeBase32_Character = number;

export type Lib_Totp_GenerateCode_Secret = string;
export type Lib_Totp_GenerateCode_Step = number;
export type Lib_Totp_GenerateCode_Returns = string;
export type Lib_Totp_GenerateCode_SecretBytes = Buffer;
export type Lib_Totp_GenerateCode_Counter = Buffer;
export type Lib_Totp_GenerateCode_Digest = Buffer;
export type Lib_Totp_GenerateCode_Offset = number;
export type Lib_Totp_GenerateCode_BinaryCode = number;
export type Lib_Totp_GenerateCode_Code = number;

export type Lib_Totp_GenerateSecret_Returns = string;
export type Lib_Totp_GenerateSecret_RandomValue = Buffer;

export type Lib_Totp_CreateUri_Secret = string;
export type Lib_Totp_CreateUri_Username = string;
export type Lib_Totp_CreateUri_Returns = string;
export type Lib_Totp_CreateUri_Issuer = string;
export type Lib_Totp_CreateUri_EncodedIssuer = string;
export type Lib_Totp_CreateUri_AccountLabel = string;

export type Lib_Totp_VerifyCode_Secret = string;
export type Lib_Totp_VerifyCode_Code = string;
export type Lib_Totp_VerifyCode_Now = number;
export type Lib_Totp_VerifyCode_Returns = number | undefined;
export type Lib_Totp_VerifyCode_Step = number;
export type Lib_Totp_VerifyCode_ProvidedBuffer = Buffer;
export type Lib_Totp_VerifyCode_CandidateStep = number;
export type Lib_Totp_VerifyCode_ExpectedCode = string;
export type Lib_Totp_VerifyCode_ExpectedBuffer = Buffer;
