import heroVideo from "./videos/hero.mp4";
import heroBanner from "./images/homepage/hero-banner.svg";
import careJourney from "./images/homepage/care-journey.svg";
import nursingIcon from "./images/homepage/service-nursing.svg";
import therapyIcon from "./images/homepage/service-therapy.svg";
import consultationIcon from "./images/homepage/service-consultation.svg";
import nursingServiceImage from "./images/services/nursing-service.svg";
import therapyServiceImage from "./images/services/ayurvedic-therapy.svg";
import counselingServiceImage from "./images/services/counseling-service.svg";
import abhishekPlaceholder from "./images/founders/abhishek-placeholder.svg";
import dharmendraPlaceholder from "./images/founders/dharmendra-placeholder.svg";
import pinkuPlaceholder from "./images/founders/pinku-placeholder.svg";
import careHeartIcon from "./images/icons/care-heart.svg";

export const homepageAssets = {
  heroVideo,
  heroBanner,
  careJourney,
  serviceIcons: {
    nursing: nursingIcon,
    therapy: therapyIcon,
    consultation: consultationIcon
  }
};

export const serviceAssets = {
  nursing: nursingServiceImage,
  therapy: therapyServiceImage,
  counselling: counselingServiceImage
};

export const founderAssets = {
  abhishek: abhishekPlaceholder,
  dharmendra: dharmendraPlaceholder,
  pinku: pinkuPlaceholder
};

export const iconAssets = {
  careHeart: careHeartIcon
};
