import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

import 'ignore-styles';

import App from '../App';

const ssrApp = (location: string) => {
    return ReactDOMServer.renderToString(
        <StaticRouter location={location}>
            <App />
        </StaticRouter>,
    );
}

export default ssrApp;