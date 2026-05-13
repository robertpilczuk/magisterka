import { useLang } from '../LangContext'
import Tooltip from './Tooltip'
import { getRatingStyle } from '../utils'

export default function UserProfile({ profile }) {
    const { t } = useLang()
    const score10 = Math.round(profile.avgRating * 2)
    const ratingInfo = getRatingStyle(profile.avgRating, t)


    return (
        <div style={{
            background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: '12px', padding: '20px',
            display: 'flex', gap: '24px', flexWrap: 'wrap',
            alignItems: 'flex-start'
        }}>
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>
                    {t('profile.id')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    #{profile.userId}
                </div>
            </div>

            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>{t('profile.gender')}</div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                    {t('gender', profile.gender === 'M' ? 'M_icon' : 'F_icon')}
                </div>
            </div>

            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>{t('profile.age')}</div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                    {t('age', profile.age)}
                </div>
            </div>

            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>{t('profile.occupation')}</div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                    {t('occupation', profile.occupation)}
                </div>
            </div>

            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>
                    {t('profile.ratings_count')}
                </div>
                <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
                    {profile.ratingsCount}
                </div>
            </div>

            <div style={{ minWidth: '200px' }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                    {t('profile.rating_style')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: ratingInfo.color }}>
                        {score10}/10
                    </span>
                    <Tooltip text={ratingInfo.desc}>
                        <span style={{
                            fontSize: '14px', fontWeight: '600',
                            color: ratingInfo.color,
                            borderBottom: `1px dashed ${ratingInfo.color}`
                        }}>
                            {ratingInfo.text}
                        </span>
                    </Tooltip>
                </div>
                <div style={{
                    background: '#e0e0e0', borderRadius: '6px',
                    height: '8px', width: '200px', overflow: 'hidden', marginBottom: '6px'
                }}>
                    <div style={{
                        width: `${score10 * 10}%`, height: '100%',
                        background: ratingInfo.color, borderRadius: '6px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    {ratingInfo.desc}
                </div>
            </div>
        </div>
    )
}