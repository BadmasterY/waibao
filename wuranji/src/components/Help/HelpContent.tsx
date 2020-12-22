import React from 'react';

import { HelpContentProps } from '../../interfaces/help';

function HelpContent(props: HelpContentProps) {
    const { onClick } = props;

    return (
        <div id="help-content">
            <div className="content-btn" onClick={onClick}></div>
            <div className="content-bg"></div>
        </div>
    );
}

export default HelpContent;