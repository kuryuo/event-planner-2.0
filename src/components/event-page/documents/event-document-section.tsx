import type {ReactNode} from 'react';
import {useId} from 'react';
import pixelsArt from '@/assets/image/pixels.svg?url';
import styles from './event-document-section.module.scss';

export interface EventDocumentSectionProps {
    title: string;
    description: string;
    emptyMessage: string;
    emptyHint?: string;
    headerAction?: ReactNode;
    emptyAction?: ReactNode;
    /** Если передано — вместо пустого состояния с pixels.svg */
    children?: ReactNode;
}

export const EventDocumentSection = ({
    title,
    description,
    emptyMessage,
    emptyHint,
    headerAction,
    emptyAction,
    children,
}: EventDocumentSectionProps) => {
    const headingId = useId();

    return (
        <section className={styles.section} aria-labelledby={headingId}>
            <header className={styles.header}>
                <h2 id={headingId} className={styles.title}>
                    {title}
                </h2>
                {headerAction && <div className={styles.headerAction}>{headerAction}</div>}
            </header>
            <p className={styles.description}>{description}</p>
            {children ? (
                <div className={styles.body}>{children}</div>
            ) : (
                <div className={styles.emptyWrap}>
                    <div
                        className={styles.emptyBackdrop}
                        style={{backgroundImage: `url(${pixelsArt})`}}
                        aria-hidden
                    />
                    <div className={styles.emptyContent}>
                        <p className={styles.emptyMessage}>{emptyMessage}</p>
                        {emptyHint && <p className={styles.emptyHint}>{emptyHint}</p>}
                        {emptyAction && <div className={styles.emptyAction}>{emptyAction}</div>}
                    </div>
                </div>
            )}
        </section>
    );
};
