"use client";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";
const initialState:LoginState={};
export default function LoginForm({returnTo}:{returnTo:string}){const [state,action]=useFormState(loginAction,initialState);return <form action={action} className="mt-6 space-y-4"><input type="hidden" name="returnTo" value={returnTo}/><label className="block text-sm text-slate-300">Email<input required name="email" type="email" autoComplete="username" className="input-field mt-1 min-h-12 w-full"/></label><label className="block text-sm text-slate-300">Password<input required name="password" type="password" autoComplete="current-password" className="input-field mt-1 min-h-12 w-full"/></label>{state.error?<p role="alert" className="rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{state.error}</p>:null}<Submit/></form>}
function Submit(){const {pending}=useFormStatus();return <button disabled={pending} className="btn-primary min-h-12 w-full disabled:cursor-wait disabled:opacity-60">{pending?"Verifying…":"Open Admin Studio"}</button>}
