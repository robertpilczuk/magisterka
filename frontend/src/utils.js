export function getRatingStyle(avg, t) {
    const score = Math.round(avg * 2)
    const key = score <= 2 ? 'critic'
        : score <= 4 ? 'skeptic'
            : score <= 5 ? 'picky'
                : score <= 6 ? 'typical'
                    : score <= 7 ? 'friendly'
                        : score <= 8 ? 'optimist'
                            : score <= 9 ? 'cinephile'
                                : 'enthusiast'

    const color = score <= 2 ? '#c0392b'
        : score <= 4 ? '#e67e22'
            : score <= 5 ? '#f39c12'
                : score <= 6 ? '#888'
                    : score <= 7 ? '#27ae60'
                        : score <= 8 ? '#2ecc71'
                            : score <= 9 ? '#16a085'
                                : '#8e44ad'

    return {
        text: t ? t('viewer_type', key) : key,
        desc: t ? t('viewer_desc', key) : key,
        color
    }
}