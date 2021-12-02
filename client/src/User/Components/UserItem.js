import { Link } from "react-router-dom";
import "./UserItem.css";
import Avatar from "../../Shared/Components/UIElements/Avatar";
import Card from "../../Shared/Components/UIElements/Card";


const UsersItem = (props) => {
  return (
    <>
      <li className="user-item">
        <Card className="user-item__content">
          <Link to={`/${props.id}/places`}>
            <div className="user-item__image">
              <Avatar image={`${process.env.REACT_APP_ASSET_URL}/${props.image}`} alt={props.name} />
            </div>
            <div className="user-item__info">
              <h2>{props.name}</h2>
              <h3>
                {props.placeCounts}{" "}
                {props.placeCounts === 1 ? "Place" : "Places"}
              </h3>
            </div>
          </Link>
        </Card>
      </li>
    </>
  );
};

export default UsersItem;
