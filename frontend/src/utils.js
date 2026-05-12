export function getRatingStyle(avg) {
    const score = Math.round(avg * 2)
    if (score <= 2) return { text: 'Krytyk', desc: 'Prawie zawsze niezadowolony — bardzo rzadko chwali filmy', color: '#c0392b' }
    if (score <= 4) return { text: 'Sceptyk', desc: 'Trudno go zachwycić — wysoką notę trzeba naprawdę zasłużyć', color: '#e67e22' }
    if (score <= 5) return { text: 'Wybredny widz', desc: 'Ogląda selektywnie i chwali tylko to co naprawdę go porusza', color: '#f39c12' }
    if (score <= 6) return { text: 'Typowy widz', desc: 'Ocenia podobnie jak większość — spokojnie przyjmuje dobre i złe', color: '#888' }
    if (score <= 7) return { text: 'Życzliwy widz', desc: 'Łatwo go zadowolić — rzadko wychodzi z kina rozczarowany', color: '#27ae60' }
    if (score <= 8) return { text: 'Optymista', desc: 'Nastawiony pozytywnie — niemal zawsze znajduje coś dobrego w filmie', color: '#2ecc71' }
    if (score <= 9) return { text: 'Miłośnik kina', desc: 'Pasjonat — kocha filmy i chętnie to wyraża wysokimi notami', color: '#16a085' }
    return { text: 'Entuzjasta', desc: 'Zachwycony niemal każdym filmem — najwyższe noty to jego standard', color: '#8e44ad' }
}