import { createApplication } from './app';

createApplication()
    .then(([app]) => {
        app.listen(3000, () => console.log('Server started: http://localhost:3000'));
    })
    .catch((e) => console.log('Error', e));
