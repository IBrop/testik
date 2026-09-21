package com.IBrop.ronpossession.network;

import com.IBrop.ronpossession.server.ServerPossession;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraftforge.network.NetworkEvent;
import java.util.function.Supplier;

public record HeroAttackPacket(int targetEntityId) {
    public static void encode(HeroAttackPacket msg, FriendlyByteBuf buf) { buf.writeVarInt(msg.targetEntityId()); }
    public static HeroAttackPacket decode(FriendlyByteBuf buf) { return new HeroAttackPacket(buf.readVarInt()); }
    public static void handle(HeroAttackPacket msg, Supplier<NetworkEvent.Context> ctxSupplier) {
        NetworkEvent.Context ctx = ctxSupplier.get();
        ctx.enqueueWork(() -> { if (ctx.getSender() != null) ServerPossession.attack(ctx.getSender(), msg.targetEntityId()); });
        ctx.setPacketHandled(true);
    }
}
