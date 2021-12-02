import { useState, useContext } from "react";

import Card from "../../Shared/Components/UIElements/Card";
import Button from "../../Shared/Components/FormsElement/Button";
import Modal from "../../Shared/Components/UIElements/Modal";
import Map from "../../Shared/Components/UIElements/Map";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";

import { AuthContext } from "../../Shared/Context/Auth-Context";
import { useHttpClient } from "../../Shared/Hooks/Http-Hook";

import "./PlaceItem.css";

const PlaceItem = (props) => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openMapHandler = () => {
    setShowMap(true);
  };
  const closeMapHandler = () => {
    setShowMap(false);
  };

  const showDeleteHandler = () => {
    setShowConfirmModal(true);
  };

  const closeDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/delete/${props.id}`,
        "DELETE",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );
      props.onDelete(props.id);
    } catch (error) {}
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={closeDeleteHandler}
        header="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <>
            <Button inverse onClick={closeDeleteHandler}>
              CANCEL
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </>
        }
      >
        <p>Do you want to delete this place?</p>
      </Modal>

      <li className="place-item">
        <Card className="pace-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          <div className="place-item__image">
            <img
              src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          <div className="place-item__actions">
            <Button inverse onClick={openMapHandler}>
              VIEW MAP
            </Button>

            {auth.userId === props.creatorID && (
              <Button to={`/places/${[props.id]}`}>EDIT</Button>
            )}
            {auth.userId === props.creatorID && (
              <Button danger onClick={showDeleteHandler}>
                DELETE
              </Button>
            )}
          </div>
        </Card>
      </li>
    </>
  );
};

export default PlaceItem;
