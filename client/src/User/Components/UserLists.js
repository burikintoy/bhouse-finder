
import Card from "../../Shared/Components/UIElements/Card";
import UsersItem from "./UserItem";

import "./UserLists.css";
import "../../../src/App.css";


const UsersList = (props) => {
  if (props.items.length === 0) {
    return (
      <div className="center">
        <Card>
          <h2>No Users Found!</h2>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ul className="users-list">
        {props.items.map((user, key) => (
          <UsersItem
            key={user.id}
            id={user.id}
            image={user.image}
            name={user.name}
            placeCounts={user.places.length}
          />
        ))}
      </ul>
    </>
  );
};

export default UsersList;
