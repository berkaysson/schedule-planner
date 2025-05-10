import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
  profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  let roleName = "Unknown";

  if (profile?.role?.name) {
    roleName = profile.role.name;
  } else {
    const sessionRole = AuthSession.getRoles();
    roleName = sessionRole ? String(sessionRole) : roleName;
  }

  return (
    <div className="profile-section">
      <div className="profile-info">
        <h2>Welcome, {profile?.name || "User"}</h2>
        <p>{profile?.email ?? AuthSession.getEmail()}</p>
        <p>{roleName}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
