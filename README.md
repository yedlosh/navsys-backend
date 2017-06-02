# navsys - Backend server #

**navsys** is a thesis project, which aims to provide an indoor navigation solution with audiovisual feedback, 
using a combination of smartphone based WiFi positioning and physical navigation units. 
For a documentation of the whole project see [navsys-docs](https://github.com/yedlosh/navsys-docs) repository.

## Backend server

The backend server is responsible for collecting the user's location, calculating the optimal path, 
activating navigator units etc. It's built using Express for it's REST API.

### Installation ###

The server is set up as an npm package. Simply install all dependencies with
```bash
$ npm install
```

### Dependencies ###

The server depends on a FIND server for location identification. It could be run locally, or the 
[public cloud instance](https://ml.internalpositioning.com/) can be used as well. 
Please refer to its [FIND repository](https://github.com/schollz/find) for details.

### Configuration ###

Configuration should be provided using .env file.
It structure should be as follows:
```
#The hosting address - Defaults to 0.0.0.0 
HOST=0.0.0.0
#Port - Defaults to 3000
PORT=3000 
#Address of FIND service - REQUIRED
FIND_SERVER_URL=https://ml.internalpositioning.com
#Group which should be used for FIND service - REQUIRED
FIND_SERVER_GROUP=groupname
#Decides if all APs or only Navigator APs should be used for fingerprinting and localization - REQUIRED
MAC_FILTERING=false
```

## Acknowledgements ##

Thanks to [schollz](https://github.com/schollz/) for creating [FIND](https://github.com/schollz/find), which is being 
used for location calculations.
