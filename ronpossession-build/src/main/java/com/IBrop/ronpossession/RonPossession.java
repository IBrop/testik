package com.IBrop.ronpossession;

import com.IBrop.ronpossession.client.ClientPossession;
import com.IBrop.ronpossession.network.ModNetwork;
import com.IBrop.ronpossession.server.ServerPossession;
import net.minecraftforge.api.distmarker.Dist;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.eventbus.api.IEventBus;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.javafmlmod.FMLJavaModLoadingContext;
import net.minecraftforge.fml.loading.FMLEnvironment;

@Mod(RonPossession.MOD_ID)
public final class RonPossession {
    public static final String MOD_ID = "ronpossession";

    public RonPossession() {
        IEventBus modBus = FMLJavaModLoadingContext.get().getModEventBus();
        ModNetwork.register();
        MinecraftForge.EVENT_BUS.register(ServerPossession.class);
        if (FMLEnvironment.dist == Dist.CLIENT) {
            ClientPossession.register(modBus);
        }
    }
}
