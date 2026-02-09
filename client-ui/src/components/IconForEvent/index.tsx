"use client";
import React, { useMemo } from "react";
import Image, { StaticImageData } from "next/image";
import IconAsian from "@/icons/Asian.png";
import IconBanana from "@/icons/Banana.png";
import IconBread from "@/icons/Bread.png";
import IconCarbs from "@/icons/Carbs.png";
import IconCarnivore from "@/icons/Carnivore.png";
import IconCold from "@/icons/Cold.png";
import IconHealthy from "@/icons/Healthy.png";
import IconMild from "@/icons/Mild.png";
import IconNoCarbs from "@/icons/No Carbs.png";
import IconSpicy from "@/icons/Spicy.png";
import IconSuperSpicy from "@/icons/Super Spicy.png";
import IconSweet from "@/icons/Sweet.png";
import IconVegan from "@/icons/Vegan.png";
import IconVegetarian from "@/icons/Vegetarian.png";
import IconWarm from "@/icons/Warm.png";
import IconWestern from "@/icons/Western.png";
import { TallyEvent } from "@/types/EventTypes";

type IconForEventProps = {
  event: TallyEvent;
};

// All available icons for random selection
const ALL_ICONS = [
  IconAsian,
  IconBanana,
  IconBread,
  IconCarbs,
  IconCarnivore,
  IconCold,
  IconHealthy,
  IconMild,
  IconNoCarbs,
  IconSpicy,
  IconSuperSpicy,
  IconSweet,
  IconVegan,
  IconVegetarian,
  IconWarm,
  IconWestern,
];

const IconForEvent: React.FC<IconForEventProps> = (props) => {
  // Use useMemo to get a consistent random icon for unknown answers
  const randomIcon = useMemo(() => {
    return ALL_ICONS[Math.floor(Math.random() * ALL_ICONS.length)];
  }, []);

  let icon: StaticImageData;

  switch (props.event.answer) {
    case "Asian":
      icon = IconAsian;
      break;

    case "Carb me up":
      icon = IconCarbs;
      break;

    case "No carbs":
      icon = IconNoCarbs;
      break;

    case "Carnivore":
      icon = IconCarnivore;
      break;

    case "A cold snack!":
      icon = IconCold;
      break;

    case "Something healthy":
      icon = IconHealthy;
      break;

    case "Sweet":
      icon = IconSweet;
      break;

    case "Spicy":
      icon = IconSpicy;
      break;

    case "Super Spicy":
      icon = IconSuperSpicy;
      break;

    case "Mild":
      icon = IconMild;
      break;

    case "Not so spicy":
      icon = IconBread;
      break;

    case "Vegan":
      icon = IconVegan;
      break;

    case "Vegetarian":
      icon = IconVegetarian;
      break;

    case "Warm":
      icon = IconWarm;
      break;

    case "Western":
      icon = IconWestern;
      break;

    default:
      icon = randomIcon;
  }

  return <Image src={icon} alt="Tally Event Icon" width={"64"} height={"64"} />;
};

export default IconForEvent;
