import React from 'react';

import { HelpButtonProps } from '../../interfaces/help';

function HelpButton(props: HelpButtonProps) {
    const { onClick } = props;

    return (
        <div id="help-button" onClick={onClick}></div>
    );
}

export default HelpButton;