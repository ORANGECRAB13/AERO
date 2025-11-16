# Data Model

## Example Data Store State
```javascript
let data = {
  users: [
    {
      controlUserId: 54757,
      nameFirst: 'Louig van',
      nameLast: 'Beethoven',
      email: 'Ludwig.B@gmail.com',
      numSuccessfulLogins: 1770,
      numFailedPasswordsSinceLastLogin: 1827
    }
  ],
  missions: [
    {
      missionId: 81,
      name: 'Les Adieux',
      timeCreated: 1809,
      timeLastEdited: 1810,
      description: 'Leaving Vienna',
      target: 'Rudolph'
    }
  ]
};
```

## Short description of the Data Model

Here you should describe what each property of data model object does. Remember to list the properties of *both* `missions control users` and `space missions`. Do not forget the properties that you can only see from the sample outputs!

| Property                                      | Type     | Description                                                                                                       |
| --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| **users**                                      | `Array<Object>` | Represents a list of all mission control users.                           |
| **users.controlUserId**                        | `Number` | Unique identifier assigned to the users.                                                                           |
| **users.nameFirst**                            | `String` | The user’s first name.                                                                                            |
| **users.nameLast**                             | `String` | The user’s last name.                                                                                             |
| **users.email**                                | `String` | The user’s email address used for login, notifications, or contact.                                               |
| **users.numSuccessfulLogins**                  | `Number` | Total count of successful login events for this user. Useful for monitoring user activity.                        |
| **users.numFailedPasswordsSinceLastLogin**     | `Number` | Number of failed password attempts recorded since the most recent successful login. Useful for ensuring security. |
| **missions**                                   | `Array<Object>` | Represents a list of all space missions.                                                              |
| **missions.missionId**                         | `Number` | Unique identifier assigned to the missions.                                                                        |
| **missions.name**                              | `String` | Name of the mission.                                                                                              |
| **missions.timeCreated**                       | `Number` | Timestamp representing when the mission was created. Can be used to sort or filter missions.                |
| **missions.timeLastEdited**                    | `Number` | Timestamp representing the most recent update to the mission. Can be used to sort or filter missions.       |
| **missions.description**                       | `String` | A description of the mission.                                                                                     |
| **missions.target**                            | `String` | The objective of the mission.                                                                                     |
