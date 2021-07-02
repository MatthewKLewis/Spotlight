Start guide for silabs locators and multilocator host apps for Airista's demo
App notes: https://www.silabs.com/documents/public/application-notes/an1296-application-development-with-rtl-library.pd

In windows from demo-host directory:  

+ Starting a locator host app

.\exe\aoa_locator.exe -t <address> -m <address>[:<port>] -c <config>

	-t <address>: IP address of the WSTK
	-m <address>[:<port>]: MQTT broker connection parameters (default localhost[:1883])
	-c <config>: path to locator config

- ex:

.\exe\aoa_locator.exe -t 10.11.10.160 -c .\config\demo.json

+ Starting a multilocator app

.\exe\aoa_multilocator.exe -c <config>

	-c <config>: path to multilocator config

- ex:

.\exe\aoa_multilocator.exe -c .\config\demo4.json