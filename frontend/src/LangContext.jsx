import { createContext, useContext, useState } from 'react'
import { setLang as setLangModule } from './i18n'
import translations from './i18n'

const LangContext = createContext()

export function LangProvider({ children }) {
    const [lang, setLangState] = useState('PL')

    function setLang(newLang) {
        setLangModule(newLang)
        setLangState(newLang)
    }

    function t(key, subkey = null) {
        const langData = translations[lang]
        const keys = key.split('.')
        let value = langData
        for (const k of keys) {
            if (value === undefined) return key
            value = value[k]
        }
        if (subkey !== null) {
            if (typeof value === 'object' && value !== null) {
                return value[subkey] ?? String(subkey)
            }
        }
        return value ?? key
    }

    return (
        <LangContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LangContext.Provider>
    )
}

export function useLang() {
    return useContext(LangContext)
}