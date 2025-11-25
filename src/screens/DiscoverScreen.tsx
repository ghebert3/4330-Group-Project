import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, Animated, Easing } from "react-native";
import board from '../../assets/discover/Mask group.png';
import x from '../../assets/discover/X (1).png';
import profile from '../../assets/discover/Ellipse 6 (1).png';
import role from '../../assets/discover/roles.png';
import expandedbio from '../../assets/discover/Rectangle 12 (1).png';
import gradientfail from '../../assets/discover/Ellipse 5.png';
import gradientmatch from '../../assets/discover/Ellipse 5 (1).png';
import polaroid1 from '../../assets/discover/Group 1 (1).png';
import picture1 from '../../assets/discover/Group 2 (2).png';
import stickynote from '../../assets/discover/Group 3 (1).png';
import sticker1 from '../../assets/discover/narutosticker.png';
import polaroid2 from '../../assets/discover/Group 4.png';
import sticker2 from '../../assets/discover/luffysticker.png';
import polaroid3 from '../../assets/discover/Group 5.png';
import polaroid4 from '../../assets/discover/Group 6.png';
import picture2 from '../../assets/discover/Group 7.png';
import sticker3 from '../../assets/discover/pochita.png';

export default function DiscoverScreen() {
    {/* Roles */}
    const roles = [
    {id: 1, tag: 'Flower'},
    {id: 2, tag: 'Anime' },
    {id: 3, tag: 'Fashion' },
    {id: 4, tag: 'Artist' },
    {id: 5, tag: 'Theater' },
    {id: 6, tag: 'Dance' },
    {id: 7, tag: 'Gamer' },
    {id: 8, tag: 'Baking' },
  ];
    const [expanded, setExpanded] = useState(false);
    const [textLines, setTextLines] = useState(0);
    {/* Animation */}
    const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);
    const animatedTop = useRef(new Animated.Value(-3)).current;

  useEffect(() => {
    const targetTop = expanded ? -45 - (textLines - 4) * 18 : -3;

    Animated.timing(animatedTop, {
      toValue: targetTop,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, 
    }).start();
  }, [expanded, textLines]);

  return (
    <View 
        style={styles.container}>
      <View 
        style={styles.bar}/>
      {/* Pin Board */}
      <ImageBackground
          source={board}
          resizeMode="contain"
          style={styles.board}
      >
      <Image
        source={x}
        style={styles.x}
      />
      <Image
        source={polaroid1}
        style={styles.polaroid1}
        resizeMode="contain"
      />
      <Image
        source={picture1}
        style={styles.picture1}
        resizeMode="contain"
      />
      <Image
        source={stickynote}
        style={styles.stickynote}
        resizeMode="contain"
      />
      <Image
        source={sticker1}
        style={styles.sticker}
        resizeMode="contain"
      />
      <Image
        source={polaroid2}
        style={styles.polaroid2}
        resizeMode="contain"
      />
      <Image
        source={sticker2}
        style={styles.sticker2}
        resizeMode="contain"
      />
      <Image
        source={polaroid3}
        style={styles.polaroid3}
        resizeMode="contain"
      />
      <Image
        source={polaroid4}
        style={styles.polaroid4}
        resizeMode="contain"
      />
      <Image
        source={picture2}
        style={styles.picture2}
        resizeMode="contain"
      />
      <Image
        source={sticker3}
        style={styles.sticker3}
        resizeMode="contain"
      />
      </ImageBackground>
      <Image
        source={gradientfail}
        style={styles.gradientfail}
        resizeMode="stretch"
      />
      <Image
        source={gradientmatch}
        style={styles.gradientmatch}
        resizeMode="stretch"
      />
      {/* Bio Section */}
      <AnimatedImageBackground
          source={expandedbio}
          resizeMode="contain"
          style={[styles.bio, {
            top: animatedTop,
          }]}
      >
      <Image
        source={profile}   
        resizeMode="contain"
        style={styles.profile}   
      />
      <Text 
        style={styles.name} 
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        Frieren, 21 | She/Her
      </Text>
      <Text 
        style={styles.major} 
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        Major in Computer Science 
      </Text>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 60 }}
        style={{top:-45}}
      > 
        {roles.map((roles) => (
             <ImageBackground
                key={roles.id} 
                source={role}
                resizeMode="contain"
                style={styles.box}
             >
             <Text 
                style={styles.roleText}
                numberOfLines={1}           
                ellipsizeMode="tail"
             >
                {roles.tag}
             </Text>
             </ImageBackground>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
      <View style={{ position: "absolute", top: -190}}>
      <Text 
        style={styles.desc} 
        onTextLayout={(e) => setTextLines(e.nativeEvent.lines.length)}
      >
        Is a donut part of the grain food group? Because grain is supposed to be good for your body, but donuts are all glazed and sugary. I get that if you get rid of the glaze and sugar, it's just grain, but that's not a donut without all that glaze and sugar. It's like, you can't~ you can't have a donut without sugar. It's just not a donut without sugar. It's a fonut. A fake donut. Or even better, a tunod. That's donut backwards. A tunod. Yes. A sugarless donut is called a tunod. I absolutely despise tunods, and they can go to hell. They would probably taste like sour bread and give you an aneurysm. I swear, if tunods ever get put into existence, I will cry. I will sue whoever made it and flood their production line. All of the tunods will be flooded and nobody will ever get another tunod. Now my stomach hurts talking about tunods, because they will 100% give everybody food poisoning. And now I'm just really tired of talking about tunods, mostly because I never wanted to talk about tunods, because they suck. So let's talk about some else. Like towels. Towels are nice. They keep you warm. And dry. Cloths are similar to towels. 
      </Text>
      </View>
      </TouchableOpacity>
      </AnimatedImageBackground>
    </View>
  );
}
{/* Formatting */}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#462F6B",
    },
    bar: {
        height: "5%", 
        backgroundColor: "black",
    },
    board: {
        alignSelf: 'center',
        width: 430,
        height: 626,
        marginTop: 25,
    },
    x: {
        top: -20,
        left: 388,
        width: 40,
        height: 30,
    },
    bio: {   
        top: -3,        
        width: "100%",          
        height: 580,       
    },
    profile: {
        top: 12,
        left: 3,
        width: 65,          
        height: 75,
    },
    name: {
        fontFamily: 'CherryBomb',
        color: 'white',
        fontSize: 30,
        top: -50,              
        left: 70,
        width: 360,
    },
    major: {
        fontFamily: 'CherryBomb',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        top: -50,              
        left: 70,
        width: 110,
    },
    box: {
        width: 70,
        height: 30,
        left: 60,
        alignItems: 'center', 
        justifyContent: 'center',
    },
    roleText: {
        fontFamily: 'CherryBomb',
        color: 'white',
        width: 60,
        textAlign: 'center',
    },
    desc: {
        fontFamily: 'CherryBomb',
        color: 'white',
        width: 380,
        left: 30,
        top: -265,
    },
    gradientfail: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 1000,
        top: 45,
    },
    gradientmatch: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 1000,
        top: 45,
    },
    polaroid1: {
        left: 40,
        width: 120,
        height: 170,
    },
    picture1: {
        width: 100,
        left: 190,
        top: -285,
    },
    stickynote: {
        width: 100,
        left: 300,
        top: -520,
    },
    sticker: {
        width: 150,
        top: -730,
        left: 205,
    },
    polaroid2: {
        width: 210,
        top: -1045,
        left: 50,
    },
    sticker2: {
        width: 90,
        top: -1380,
        left: 25,
    },
    polaroid3: {
        width: 160,
        top: -1705,
        left: 250,
    },
    polaroid4: {
        width: 220,
        top: -2260,
        left: 30,
    },
    picture2: {
        width: 190,
        top: -2575,
        left: 130,
    },
    sticker3: {
        width: 120,
        top: -2890,
        left: 305,
    },
});
