# Use SPFX modern (kind of) with SP 2019

Based on [blog post by Sergei Sergeev](https://spblog.net/post/2019/08/08/build-sharepoint-framework-solutions-for-on-premises-sharepoint-with-any-version-of-react-typescript-or-office-ui-fabric-react)

## Right version of Node (14.17.1)

### First time

Install Node 14.17.1 with [nvm](https://github.com/coreybutler/nvm-windows)
```
nvm install 14.17.1
nvm use 14.17.1
```

Install Yeoman generator
```
npm install gulp-cli@2.3.0 --global
npm install yo@2.0.6 --global
npm install @microsoft/generator-sharepoint@1.10.0 --global
```

### else and not on Node 14.17.1

Switch to Node 14.17.1
```
nvm use 14.17.1
```

## Prepare folders

### SPFX folder

Create a folder for your solution with a subfolder spfx and enter it
```
md [my-folder-name]
cd [my-folder-name]
md spfx
cd spfx
```

Run yeoman generator
```
yo @microsoft/sharepoint --skip-install
```
* Select name for your solution
* Select `SharePoint 2019 onwards, including SharePoint Online`
* Select `Use the current folder`
* Select `Y` Yes we want to be able to add to all sites (if appropriate
)
* Select `WebPart`
* Select a proper name (This is referenced as [your WebPart] in rest of this guide)
* Enter a nice description
* Select `React`

Copy files from `spfx` folder here to new `spfx` folder.
```
copy ..\..\Spfx2019\spfx\* .
```

Run npm install, fix dependencies and run npm install again
```
npm install
node FixDep141.js
npm install
```

### External folder

Create a folder external at the same level as the spfx folder
```
cd ..
md external
cd external
```

Copy files from `external` folder here to new `external` folder.
```
xcopy ..\..\Spfx2019\external\ . /s
```

Run npm install
```
npm install
```

## Move WebPart code

### Copy WebPart
Copy src folder from spfx to external
```
xcopy ..\spfx\src src\ /s
```

### Remove files/folders from where they aren't maintained

#### From `external`
* Delete `loc` folder from `external\src\webparts\[your WebPart]`
* Delete `[your WebPart]WebPart.manifest.json` from `external\src\webparts\[your WebPart]`

#### From `spfx`
* Delete `components` folder from `spfx\src\webparts\[your WebPart]`

### Update files

#### In `external`

##### Create right bundle
`external\webpack\webpack.common.js`
Change the entry element to match your WebPart

From 
```
        'hello-world-web-part': path.join(__dirname, '../src/webparts/helloWorld/HelloWorldWebPart.ts')
```
to
```
        'afdelings-oprulning-web-part': path.join(__dirname, '../src/webparts/AfdelingsOprulning/AfdelingsOprulningWebPart.ts')
```

Change the external for strings to match your WebPart

From
```
        'HelloWorldWebPartStrings',
```
to
```
        'AfdelingsOprulningWebPartStrings',
```

##### Support Office UI Fabric version 7.x

In `external\src\webparts\[your WebPart]\[your WebPart]WebPart.ts` add the following after the imports
```ts
/**
 * Fix to make it work with OUIFR 7.x
 */

import { GlobalSettings } from '@uifabric/utilities/lib/GlobalSettings';
import { getTheme } from '@uifabric/styling/lib/styles/theme';

try {
  const customizations = GlobalSettings.getValue('customizations');
  const theme = getTheme();
  (customizations as any).settings.theme.effects = { ...theme.effects }; // eslint-disable-line  @typescript-eslint/no-explicit-any
  (customizations as any).settings.theme.spacing = { ...theme.spacing }; // eslint-disable-line  @typescript-eslint/no-explicit-any
  (customizations as any).settings.theme.fonts = { ...theme.fonts }; // eslint-disable-line  @typescript-eslint/no-explicit-any
  (customizations as any).settings.theme.semanticColors = { ...theme.semanticColors }; // eslint-disable-line  @typescript-eslint/no-explicit-any
}
catch (err) {
  console.log('An error might appear if you are running in SharePoint Online. This is expected');
}
/**
 * End of fix
 */
```

#### In `spfx`

##### Load web part from external
Change `spfx\src\webparts\[your WebPart]\[your WebPart]WebPart.ts` to where the last part of the require should match your bundle name
```ts
/* tslint:disable */

const externalWP: any = require('../../../../external/dist/afdelings-oprulning-web-part');

export default externalWP.default;
```

## Develop using "modern" React

### Get started with new code

You can now replace the code in `external\src\webparts\[your WebPart]\components\[your WebPart].tsx` with more modern React code like this (Replace HelloWorld with [your WebPart]):

```ts
import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import styles from './HelloWorld.module.scss';
import { IHelloWorldProps } from './IHelloWorldProps';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { escape } from '@microsoft/sp-lodash-subset';

const HelloWorld: FunctionComponent<IHelloWorldProps> = ({ description }) => {
  const [count, setCount] = useState(0);
  return (
    <div className={styles.helloWorld} >
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.column}>
            <h2>Welcome to SharePoint!</h2>
            <p><Text variant={'large'}>Customize SharePoint experiences using Web Parts.</Text></p>
            <p className={styles.description}>{escape(description)}</p>
            <Stack horizontal tokens={{childrenGap:20}}>
              <PrimaryButton text='Learn more' href='https://aka.ms/spfx' />
              <DefaultButton text={'Increment count from ' + count} onClick={() => setCount(count + 1)} />
            </Stack>
          </div>
        </div>
      </div>
    </div >
  );
}

export default HelloWorld;
```

### Development flow
In your `external` folder run 
```
npm run watch
```
It will spin up a webpack watch process, and gulp watch process as well. Gulp watcher is responsible for reloading our web part when source code changes, and for coping TypeScript definitions for resources. 

In `spfx` folder simply run
```
gulp serve
```

### Production flow
For production in your `external` folder run 
```
npm run build
```
This will pack your solution using production settings. 

Then in `spfx` folder run
```
gulp bundle --ship 
gulp package-solution --ship
```
This will pack your SharePoint Framework package, it will be ready to distribution. 


