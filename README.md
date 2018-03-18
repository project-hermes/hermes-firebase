# hermes-firebase

[![Join the chat at https://gitter.im/hermes-firebase/Lobby](https://badges.gitter.im/hermes-firebase/Lobby.svg)](https://gitter.im/hermes-firebase/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/sonyccd/hermes-firebase.svg?branch=master)](https://travis-ci.org/sonyccd/hermes-firebase)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/dd6fcab8566444d486ccb79b8ec91494)](https://app.codacy.com/app/sonyccd/hermes-firebase?utm_source=github.com&utm_medium=referral&utm_content=sonyccd/hermes-firebase&utm_campaign=badger)
[![Dependencies](https://david-dm.org/sonyccd/hermes-firebase.svg)](https://david-dm.org/sonyccd/hermes-firebase)

Firebase code for project hermes

## To devel

```
$ npm install -g firebase-tools
$ firebase serve   # Start development server
$ firebase deploy  # Deploy new version of everything
```

## Databse

All data is layed out in Google Firestore document databse
```
{
    "Sensor": {
        "s2d4t6rdw46yew3f": {
            "Name": "hermes1",
            "Id": 12334,
            "SimID": 12345,
            "FirmwareV": 0.05,
            "BuildV": 0.01,
            "LastUpdate": 1543742463,
            "Mode": "debug",
            "Dive": {
                "3d3r5fw32r45fgr56yne46ewg": {
                    "Time": 153453533,
                    "Start Lat": 23.24323432,
                    "Start Long": -31.2423424,
                    "End Lat": 23.456435,
                    "End Long": -31.564564,
                    "Duration": 1234345,
                    "Name": "key largo",
                    "Diver": "Brad Bazemore",
                    "Data": {
                        "2s23d43654f4yef53g43q": {
                            "time": 154575673,
                            "temp": 89.34,
                            "depth": 6547
                        },
                        "4r43fr5tr44rfw34tfe4t": {
                            "time": 154575679,
                            "temp": 89.42,
                            "depth": 6553
                        }
                    }
                }
            }
        }
    }
}
```