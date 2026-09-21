package com.IBrop.ronpossession.network;

import com.IBrop.ronpossession.server.ServerPossession;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraftforge.network.NetworkEvent;
import java.util.function.Supplier;

public record PossessHeroPacket(int heroEntityId) {
    public static void encode(PossessHeroPacket msg, FriendlyByteBuf buf) { buf.writeVarInt(msg.heroEntityId()); }
    public static PossessHeroPacket decode(FriendlyByteBuf buf) { return new PossessHeroPacket(buf.readVarInt()); }
    public static void handle(PossessHeroPacket msg, Supplier<NetworkEvent.Context> ctxSupplier) {
        NetworkEvent.Context ctx = ctxSupplier.get();
        ctx.enqueueWork(() -> { if (ctx.getSender() != null) ServerPossession.begin(ctx.getSender(), msg.heroEntityId()); });
        ctx.setPacketHandled(true);
    }
}
