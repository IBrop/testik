package com.IBrop.ronpossession.network;

import com.IBrop.ronpossession.RonPossession;
import net.minecraft.resources.ResourceLocation;
import net.minecraftforge.network.NetworkRegistry;
import net.minecraftforge.network.simple.SimpleChannel;

public final class ModNetwork {
    private static final String PROTOCOL = "1";
    public static final SimpleChannel CHANNEL = NetworkRegistry.newSimpleChannel(
            new ResourceLocation(RonPossession.MOD_ID, "main"),
            () -> PROTOCOL,
            PROTOCOL::equals,
            PROTOCOL::equals
    );
    private ModNetwork() {}
    public static void register() {
        int id = 0;
        CHANNEL.registerMessage(id++, PossessHeroPacket.class, PossessHeroPacket::encode, PossessHeroPacket::decode, PossessHeroPacket::handle);
        CHANNEL.registerMessage(id++, ExitPossessionPacket.class, ExitPossessionPacket::encode, ExitPossessionPacket::decode, ExitPossessionPacket::handle);
        CHANNEL.registerMessage(id++, HeroInputPacket.class, HeroInputPacket::encode, HeroInputPacket::decode, HeroInputPacket::handle);
        CHANNEL.registerMessage(id, HeroAttackPacket.class, HeroAttackPacket::encode, HeroAttackPacket::decode, HeroAttackPacket::handle);
    }
}
