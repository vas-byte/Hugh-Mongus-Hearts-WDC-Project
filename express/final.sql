-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: webPage
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `webPage`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `webPage` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `webPage`;

--
-- Table structure for table `AdminTokens`
--

DROP TABLE IF EXISTS `AdminTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AdminTokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(40) NOT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `AdminTokens_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AdminTokens`
--

LOCK TABLES `AdminTokens` WRITE;
/*!40000 ALTER TABLE `AdminTokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `AdminTokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Attendees`
--

DROP TABLE IF EXISTS `Attendees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Attendees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Attendees_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Attendees`
--

LOCK TABLES `Attendees` WRITE;
/*!40000 ALTER TABLE `Attendees` DISABLE KEYS */;
INSERT INTO `Attendees` VALUES (1,1,1),(2,2,2),(3,1,2),(5,4,1),(6,4,2);
/*!40000 ALTER TABLE `Attendees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BranchMembers`
--

DROP TABLE IF EXISTS `BranchMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BranchMembers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_manager` int NOT NULL,
  `branch_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `event_notifications` int NOT NULL DEFAULT '1',
  `post_notifications` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_user_branch` (`user_id`,`branch_id`),
  KEY `branch_id` (`branch_id`),
  CONSTRAINT `BranchMembers_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `Branches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `BranchMembers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BranchMembers`
--

LOCK TABLES `BranchMembers` WRITE;
/*!40000 ALTER TABLE `BranchMembers` DISABLE KEYS */;
INSERT INTO `BranchMembers` VALUES (2,0,2,1,0,0),(4,1,1,2,0,0),(6,0,1,1,0,0);
/*!40000 ALTER TABLE `BranchMembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Branches`
--

DROP TABLE IF EXISTS `Branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(63) NOT NULL,
  `address_line` varchar(256) NOT NULL,
  `suburb` varchar(63) NOT NULL,
  `state` varchar(63) NOT NULL,
  `postcode` varchar(8) NOT NULL,
  `statement` varchar(1024) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Branches`
--

LOCK TABLES `Branches` WRITE;
/*!40000 ALTER TABLE `Branches` DISABLE KEYS */;
INSERT INTO `Branches` VALUES (1,'Adelaide','1 North Terrace','Adelaide City','SA','5000','Adelaide\'s branch'),(2,'Sydney','1 Sydney Ave','Sydney City','NSW','2000','Sydney\'s branch');
/*!40000 ALTER TABLE `Branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(63) NOT NULL,
  `subtitle` varchar(63) NOT NULL,
  `content` varchar(2048) NOT NULL,
  `address_line` varchar(256) NOT NULL,
  `suburb` varchar(63) NOT NULL,
  `state` varchar(63) NOT NULL,
  `postcode` varchar(8) NOT NULL,
  `datetime` datetime NOT NULL,
  `public` int NOT NULL,
  `organisation_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `organisation_id` (`organisation_id`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`organisation_id`) REFERENCES `Organisations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES (1,'Membership Event Night','Come and join us!','To all our members, we are excited to invite you to our annual membership event night at the Adelaide Convention Centre. It is important to us to celebrate all our members who give frequently and involve themselves with the local community. Join us so we can celebrate the critical work done by our staff and donors. ','12 North Terrace','Adelaide','SA','5000','2024-06-15 20:00:00',0,1),(2,'Blood Donation Facility Grand Opening','Opening event for our brand new blood donation facility','The Royal Adelaide Hospital is excited to announce the grand opening of our state-of-the-art blood donation facility. We invite you to celebrate this milestone with us and learn more about the vital role blood donors play in saving lives. The event will feature guided tours, donor appreciation activities, and information sessions on the impact of blood donation. Enjoy light refreshments and meet our dedicated medical staff who will be on hand to answer any questions. Your participation helps ensure that our community continues to receive the highest standard of care. Mark your calendars and be a part of this special occasion – together, we can make a lifesaving difference!','Port Road','Adelaide','SA','5000','2024-06-13 11:00:00',1,1),(3,'Health and Wellness Fair','All welcome!','Mark your calendars for our Health and Wellness Fair on July 5th. This event will offer free health screenings, informational booths on nutrition and fitness, and demonstrations on healthy living. Blood donation stations will be set up throughout the fair, so you can give the gift of life while learning how to improve your own. All are welcome to attend!','110 Grenfell St','Adelaide','SA','5000','2024-07-05 09:00:00',1,2),(4,'Demonstration of RSVP\'d List','Subtitle','Events effectively function exactly the same as posts but they give both members and non-members the ability to RSVP (I\'m going button). Admins and branch managers have the ability to view the RSVP\'d list by selecting the attendees icon in the top right of the div. ','Address','Suburb','State','Postcode','2024-06-11 13:00:00',1,3);
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OrganisationMembers`
--

DROP TABLE IF EXISTS `OrganisationMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrganisationMembers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_manager` int NOT NULL,
  `organisation_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `event_notifications` int NOT NULL DEFAULT '1',
  `post_notifications` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_user_organisation` (`user_id`,`organisation_id`),
  KEY `organisation_id` (`organisation_id`),
  CONSTRAINT `OrganisationMembers_ibfk_1` FOREIGN KEY (`organisation_id`) REFERENCES `Organisations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `OrganisationMembers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OrganisationMembers`
--

LOCK TABLES `OrganisationMembers` WRITE;
/*!40000 ALTER TABLE `OrganisationMembers` DISABLE KEYS */;
INSERT INTO `OrganisationMembers` VALUES (1,0,1,1,0,0),(2,1,1,2,0,0),(3,0,2,1,0,0),(4,0,3,1,0,0),(5,0,3,2,0,0);
/*!40000 ALTER TABLE `OrganisationMembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Organisations`
--

DROP TABLE IF EXISTS `Organisations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Organisations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(63) NOT NULL,
  `address_line` varchar(256) NOT NULL,
  `suburb` varchar(63) NOT NULL,
  `state` varchar(63) NOT NULL,
  `postcode` varchar(8) NOT NULL,
  `statement` varchar(1024) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Organisations`
--

LOCK TABLES `Organisations` WRITE;
/*!40000 ALTER TABLE `Organisations` DISABLE KEYS */;
INSERT INTO `Organisations` VALUES (1,'Royal Adelaide Hospital','1 Port Road','Adelaide','SA','5000','The Royal Adelaide Hospital (RAH) is proud to partner with Hugh Mongus Hearts to promote the critical importance of blood donation. As one of Australia\'s leading healthcare institutions, RAH is dedicated to providing exceptional medical care and advancing health outcomes for our community. Our state-of-the-art facilities and compassionate staff rely on the generosity of blood donors to support a wide range of treatments and emergency services. Your donation at RAH directly contributes to saving lives, supporting surgeries, trauma care, cancer treatments, and more. Join us in our mission to enhance patient care and improve health through the gift of blood. Every donation counts – become a part of our lifesaving team today.'),(2,'Lifeblood Adelaide Donor Centre','110 Grenfell St','Adelaide','SA','5000','At the Lifeblood Centre, we are committed to making a lifesaving impact through the power of blood donation. Our state-of-the-art facility is designed to provide a comfortable and efficient donation experience, ensuring that every donor feels valued and appreciated. By donating blood at the Lifeblood Centre, you directly support patients in need, from trauma victims and surgery patients to those battling chronic illnesses and cancer. Our dedicated team of healthcare professionals is here to guide you through every step of the donation process, providing expert care and support. Join us in our mission to save lives and strengthen our community’s health. Your donation today can make a world of difference tomorrow.'),(3,'Test Organisation - Demo Video','Address line','Suburb','State','Postcode','Statement');
/*!40000 ALTER TABLE `Organisations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Posts`
--

DROP TABLE IF EXISTS `Posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(63) NOT NULL,
  `content` varchar(2048) NOT NULL,
  `created_on` date NOT NULL,
  `is_private` int NOT NULL,
  `organisation_id` int NOT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `organisation_id` (`organisation_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `Posts_ibfk_1` FOREIGN KEY (`organisation_id`) REFERENCES `Organisations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Posts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `Users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Posts`
--

LOCK TABLES `Posts` WRITE;
/*!40000 ALTER TABLE `Posts` DISABLE KEYS */;
INSERT INTO `Posts` VALUES (1,'Donors Needed!','This week the Red Cross have indicated that they are expecting a blood donation shortage for the following week. We are urgently calling any who have the time and ability to give to someone in need, to head over to the Royal Adelaide Hospital and donate today!','2024-06-11',0,1,1),(2,'Membership Event Night','To all our members, check out the details for our membership event night this Saturday. Looking forward to seeing you all there!','2024-06-11',1,1,1),(3,'New Donation Facility','The management team at the Royal Adelaide Hospital are thrilled to announce the opening of a new blood donation facility. This new facility contains a wide array of new improvements for both our hospital staff and our volunteers. Come and check it out today!','2024-06-11',0,1,1),(4,'Exclusive Member Appreciation Week','Dear Members, we are excited to announce our Member Appreciation Week from August 1st to August 7th. This special week is dedicated to you, our loyal donors, for your unwavering support. Enjoy exclusive perks such as priority booking for donation appointments, complimentary wellness checks, and a special appreciation gift. Thank you for your commitment to saving lives!','2024-06-11',1,2,1),(5,'Urgent Call for Blood Donations','Help us save lives! The Lifeblood Centre is experiencing a critical shortage of blood supplies and urgently needs donors of all blood types. Your donation can make a significant difference in the lives of patients in our community. Walk-ins are welcome, or you can schedule an appointment online. Together, we can ensure that everyone who needs blood gets it in time. Donate today and be a hero!','2024-06-11',0,2,1),(6,'Launch of Our Mobile Donation Unit','We are thrilled to announce the launch of our new Mobile Donation Unit! Starting next month, the Lifeblood Centre will bring the convenience of blood donation to your neighbourhood. Our mobile unit is equipped with everything needed to ensure a safe and comfortable donation experience. Check our website for the upcoming schedule and locations. Your community, your donation – together, we save lives!','2024-06-11',0,2,1),(7,'Member-Only Blood Donation Training Workshop','We are pleased to invite our members to a Blood Donation Training Workshop on September 15th. This workshop is designed to provide in-depth knowledge about the blood donation process, the importance of regular donations, and how to advocate for blood donation within your community. Spaces are limited, so please RSVP by September 1st to secure your spot. Let’s empower ourselves to make an even greater impact!','2024-06-11',1,2,1),(8,'Test Announcement - PRIVATE','Only viewable to members.','2024-06-11',1,3,1),(9,'Test Announcement - PUBLIC','Viewable to everyone.','2024-06-11',0,3,1),(10,'Edit me','Showcase of editing post feature.','2024-06-11',0,3,1);
/*!40000 ALTER TABLE `Posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ResetTokens`
--

DROP TABLE IF EXISTS `ResetTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ResetTokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ResetTokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ResetTokens`
--

LOCK TABLES `ResetTokens` WRITE;
/*!40000 ALTER TABLE `ResetTokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `ResetTokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(63) NOT NULL,
  `last_name` varchar(63) NOT NULL,
  `email` varchar(320) NOT NULL,
  `user_password` varchar(320) DEFAULT NULL,
  `is_oauth` int NOT NULL,
  `is_admin` int NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Joe','Smith','admin@admin.com','$2b$10$DhpKQQjY7tdah69j6G8HKeIzVS7ojbFppUh/3IuO/FGgeJGkh5BhK',0,1),(2,'Greg','Page','user1@user.com','$2b$10$oT6gJBvuNzW88SffaHqZI.Pr4vavAljCOUJUaf.COolNndd9AEi4W',0,0);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-11  2:41:34
