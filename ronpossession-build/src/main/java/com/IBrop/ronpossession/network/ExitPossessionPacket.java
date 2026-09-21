package com.IBrop.ronpossession.network;

import com.IBrop.ronpossession.server.ServerPossession;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraftforge.network.NetworkEvent;
import java.util.function.Supplier;

public final class ExitPossessionPacket {
    public static void encode(ExitPossessionPacket msg, FriendlyByteBuf buf) {}
    public static ExitPossessionPacket decode(FriendlyByteBuf buf) { return new ExitPossessionPacket(); }
    public static void handle(ExitPossessionPacket msg, Supplier<NetworkEvent.Context> ctxSupplier) {
        NetworkEvent.Context ctx = ctxSupplier.get();
        ctx.enqueueWork(() -> { if (ctx.getSender() != null) ServerPossession.end(ctx.getSender()); });
        ctx.setPacketHandled(true);
    }
}
