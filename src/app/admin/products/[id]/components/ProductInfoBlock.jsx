import { Button } from '@/components/ui/button';
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown';
import styles from './post.module.css';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm'; // Import the plugin

function ProductInfoBlock({ description }) {
    return (
        <div>
            {description && (
                <div className="">
                    <div className="prose max-w-none text-gray-700 leading-relaxed">
                        <div className={`${styles.postStyle}`}>
                            <ReactMarkdown
                                rehypePlugins={[rehypeRaw]}
                                remarkPlugins={[remarkGfm]}
                            >
                                {description}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductInfoBlock