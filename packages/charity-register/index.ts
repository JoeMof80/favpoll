// The Charity Commission register: the live API, and the mirror of it that
// `scripts/register/load-register.ts` loads into `register_charities`.
//
// Both apps had a full copy of each module. They had already drifted — see
// register-mirror.ts — and the drift was invisible because the two copies
// were formatted differently (#1103 fixed that, #1108 removed the copies).
export * from "./charity-commission"
export * from "./register-mirror"
