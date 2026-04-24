import type {ReactNode} from 'react';
import {useId} from 'react';
import pixelsArt from '@/assets/image/pixels.svg?url';
import styles from './event-document-section.module.scss';

export interface EventDocumentSectionProps {
    title: string;
    description: string;
    emptyMessage: string;
    /** Если передано — вместо пустого состояния с pixels.svg */
    children?: ReactNode;
}

export const EventDocumentSection = ({
    title,
    description,
    emptyMessage,
    children,
}: EventDocumentSectionProps) => {
    const headingId = useId();

    return (
        <section className={styles.section} aria-labelledby={headingId}>
            <h2 id={headingId} className={styles.title}>
                {title}
            </h2>
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
                    <p className={styles.emptyMessage}>{emptyMessage}</p>
                </div>
            )}
        </section>
    );
};
