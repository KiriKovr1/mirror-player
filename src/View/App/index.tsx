import React from 'react';
import {
    Routes,
    Route,
} from 'react-router-dom';
import { Provider } from 'react-redux';

import store from '../Redux';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const App: React.FC = () => {
    return (
        <Provider store={store}>
                <Routes>
                    <Route path='/panti/*' element={<div>default</div>} />
                </Routes>
        </Provider>
    )
}

export default App;


