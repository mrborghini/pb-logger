# PB Logger

This package allows for simple remote control of applications over WebRTC. You need to have a pocketbase environment pre-installed, and setup with a application account, and `errors` table

## Installation

The package can be installed using npm:

```
npm i pb-logger
```

## Example Usage

Once the package is installed you get access to a single class: `Logger`. This class has 4 methods:

- `Logger.init(app: string, key: string, pocketbaseUrl)`, use this to login to your Logger account, and provider access to your PB instance
- `Logger.log(message: any)`, log any info
- `Logger.error(message: any)`, log any error info
- `Logger.warning(message: any)`, log any warning info
