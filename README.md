pfSense® Actions
=================

[![GitHub Releases](https://img.shields.io/github/v/release/mrjackyliang/pfsense-actions?style=flat-square&logo=github&logoColor=%23ffffff&color=%23b25da6)](https://github.com/mrjackyliang/pfsense-actions/releases)
[![GitHub Top Languages](https://img.shields.io/github/languages/top/mrjackyliang/pfsense-actions?style=flat-square&logo=typescript&logoColor=%23ffffff&color=%236688c3)](https://github.com/mrjackyliang/pfsense-actions)
[![GitHub License](https://img.shields.io/github/license/mrjackyliang/pfsense-actions?style=flat-square&logo=googledocs&logoColor=%23ffffff&color=%2348a56a)](https://github.com/mrjackyliang/pfsense-actions/blob/main/LICENSE)
[![Become a GitHub Sponsor](https://img.shields.io/badge/github-sponsor-gray?style=flat-square&logo=githubsponsors&logoColor=%23ffffff&color=%23eaaf41)](https://github.com/sponsors/mrjackyliang)
[![Donate via PayPal](https://img.shields.io/badge/paypal-donate-gray?style=flat-square&logo=paypal&logoColor=%23ffffff&color=%23ce4a4a)](https://liang.nyc/paypal)

This is a Docker-based image to be deployed on a local server that allows you to run quick actions remotely without logging into your pfSense® system.

This controller allows you to run simple actions such as Wake-on-LAN and reloading firewall filters. __This controller prioritizes security in its design and does not allow modifying or exporting any configurations.__

To use this controller, here are three simple steps you need to follow:
1. Deploy the controller using the [instructions](#instructions) below.
2. Verify your deployment after the Docker runs successfully.
3. Implement this controller using your scripts!

## Instructions
Run this controller using a Docker `run` command. Before deployment, ensure that you have [SSH](#setting-up-secure-shell) configured on your firewall, then replace the environment variables to run the container.
```shell
docker run \
    -d \
    -e "API_KEY=" \
    -e "PORT=" \
    -e "PFSENSE_SSH_IP=192.168.1.1" \
    -e "PFSENSE_SSH_PORT=22" \
    -e "PFSENSE_USERNAME=admin" \
    -e "PFSENSE_PASSWORD=pfsense" \
    -e "PFSENSE_PRIVATE_KEY=" \
    -p 9898:9898 \
    --name pfsense-actions \
    mrjackyliang/pfsense-actions:latest
```

Alternatively, a `docker-compose.yml` is provided to you, with a sample below. Simply paste the configuration shown below and replace the environment variables:
```yaml
services:
  pfsense-actions:
    image: "mrjackyliang/pfsense-actions:latest"
    environment:
      - "API_KEY="
      - "PORT="
      - "PFSENSE_SSH_IP=192.168.1.1"
      - "PFSENSE_SSH_PORT=22"
      - "PFSENSE_USERNAME=admin"
      - "PFSENSE_PASSWORD=pfsense"
      - "PFSENSE_PRIVATE_KEY="
    ports:
      - "9898:9898"
```

## Environment Variables
| Variable              | Description                                                             | Required | Default                                     |
|-----------------------|-------------------------------------------------------------------------|----------|---------------------------------------------|
| `API_KEY`             | An API key used to access pfSense® Actions                              | `false`  | Randomly generates a UUID on every start-up |
| `PORT`                | The HTTP port used to access pfSense® Actions                           | `false`  | `9898`                                      |
| `PFSENSE_SSH_IP`      | IP address of your pfSense® firewall used to initiate an SSH connection | `true`   |                                             |
| `PFSENSE_SSH_PORT`    | SSH port of your pfSense® firewall used to initiate an SSH connection   | `true`   |                                             |
| `PFSENSE_USERNAME`    | Username to login to your pfSense® firewall                             | `true`   |                                             |
| `PFSENSE_PASSWORD`    | Password to login to your pfSense® firewall                             | `true`   |                                             |
| `PFSENSE_PRIVATE_KEY` | Contents of the private key to login to your pfSense® firewall          | `true`   |                                             |

## Available Endpoints
| Endpoint        | Description                                               | Method | Instructions                                                |
|-----------------|-----------------------------------------------------------|--------|-------------------------------------------------------------|
| `reload-filter` | Reload the filters on your pfSense® firewall              | `GET`  | [Reload Filter Endpoint](#reload-filter-endpoint)           |
| `update-dyndns` | Update the Dynamic DNS settings on your pfSense® firewall | `GET`  | [Update Dynamic DNS Endpoint](#update-dynamic-dns-endpoint) |
| `wol`           | Send a Wake-on-LAN request to a connected device          | `POST` | [Wake-on-LAN Endpoint](#wake-on-lan-endpoint)               |

## Authorizing Your Requests
When accessing the controller, ensure that you have the `Authorization` header properly set to the `API_KEY` you specified during image creation. For example:

```http request
GET http://localhost:9898
Authorization: Bearer [YOUR_API_KEY]
```

__Note:__ To protect against data leaks, the server only replies with HTTP response codes.

__Note 2:__ If you do not specify an `API_KEY` during build, an `API_KEY` will be provided for you and will randomize on every container restart.

## Setting Up Secure Shell
The controller authenticates itself through the Secure Shell (SSH). If you have not enabled Secure Shell, follow the instructions below:

1. Login to the pfSense web interface.
2. Under the __System__ dropdown, click __Advanced__.
3. Scroll down to the __Secure Shell__ section.
4. Check the __Enable Secure Shell__ checkbox.
5. Click the __Save__ button at the bottom of the page.

__Note:__ Ensure that the user you are logging in from has the __User - System: Shell account access__ privilege.

__Note 2:__ If you wish to use a private key, paste the contents of the key into the `PFSENSE_PRIVATE_KEY` directly and do not include the path of the file.

## Using the Endpoints
This section describes how to interact with the available API endpoints for managing your pfSense® firewall.

#### Reload Filter Endpoint:
```http request
GET http://localhost:9898/reload-filter
Authorization: Bearer [YOUR_API_KEY]
```
#### Update Dynamic DNS Endpoint:
```http request
GET http://localhost:9898/update-dyndns
Authorization: Bearer [YOUR_API_KEY]
```
#### Wake-on-LAN Endpoint:
```http request
POST http://localhost:9898/wol
Authorization: Bearer [YOUR_API_KEY]
Content-Type: application/json

{
  "broadcastAddress": "[YOUR_BROADCAST_IP_ADDRESS]",
  "macAddress": "[YOUR_MAC_ADDRESS]"
}
```

## Retrieving the Broadcast IP Address
In order to send a Wake-on-LAN request, a broadcast address is required since magic packets cannot be sent across subnets. Follow the instructions below:

1. Login to the pfSense web interface.
2. Under the __Interfaces__ dropdown, click on the interface where the device belongs to.
3. On the address bar, look for the `if=` parameter and copy the value. The interface value should look something like `igb1`, `opt1`, or `lan`.
4. Copy the [PHP Code](#php-code) shown below and replace `[YOUR_INTERFACE_ID]` with your interface value.
5. Run the code under __Diagnostics__ > __Command Prompt__ > __Execute PHP Commands__ section.

#### PHP Code:
```php
$interface = '[YOUR_INTERFACE_ID]';

echo gen_subnet_max(get_interface_ip($interface), get_interface_subnet($interface));
```

## Credits and Appreciation
If you find value in the ongoing development of this controller and wish to express your appreciation, you have the option to become my supporter on [GitHub Sponsors](https://github.com/sponsors/mrjackyliang)!
