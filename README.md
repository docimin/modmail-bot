# fyfu-modmail
Fyfu ModMail

## Einrichten
Zum Einrichten muss die Datei `.env` ausgefüllt werden.

## Nachrichten editieren
Alle Nachrichten sind in `./bot/assets/messages` gespeichert und können beliebig editiert werden.

Um Nachrichten zu visualiseren kann ein beliebiger Discord Nachrichten Editor verwendet werden, wie bspw. der im Dashboard von [Sapphire](https://dashboard.sapph.xyz).

## Slash Command Permissions
Alle User, die als Manager in der `.env` eingetragen sind, haben automatisch Rechte, alle Slash Commands auszuführen.

Zusätzlich können User und Rollen im "User Management" Tab hinzugefügt werden. Diese bekommen **nach einem Neustart** auch Rechte, die Slash Commands ausführen zu können.

Der `/support` Command ist immer für alle User zugänglich.

## Code editieren

### Bot
Wenn der Code in `./bot` editiert wurde, muss er neu gestartet werden.

### Website
Wenn der Code in `./dashboard/src` editiert wurde, muss folgendes in `./dashboard` ausgeführt werden:

```
npm i
npm run build
```