import PropTypes from "prop-types";

const ProfileCard = ({ avatar, name, role }) => {
  return (
    <div className="flex-grow">
      <div className="flex items-center justify-end space-x-4">
        <img className="rounded-full w-16 bg-white" src={avatar}></img>
        <div className="">
          <div>Serdar Turgut</div>
          <div className="text-center">Yönetici</div>
        </div>
      </div>
    </div>
  );
};

ProfileCard.propTypes = {
  avatar: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
};

export default ProfileCard;
