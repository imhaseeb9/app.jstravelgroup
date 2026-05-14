import CustomCardAction from './CustomCardAction.vue';
import CustomCardContent from './CustomCardContent.vue';
import CustomCardHeader from './CustomCardHeader.vue';
import CustomCardTitle from './CustomCardTitle.vue';
import CustomCard from './index.vue';

CustomCard.Header = CustomCardHeader;
CustomCard.Content = CustomCardContent;
CustomCard.Title = CustomCardTitle;
CustomCard.Action = CustomCardAction;

export { CustomCard };
